"""JWT authentication and authorization."""

import os
from typing import Optional
import json
import base64

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Load environment variables
load_dotenv()

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
TEST_MODE = os.getenv("TEST_MODE", "false").lower() == "true"

if not JWT_SECRET and not TEST_MODE:
    raise ValueError(
        "JWT_SECRET environment variable is required. "
        "Must match BETTER_AUTH_SECRET from frontend."
    )

# HTTP Bearer token scheme
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and extract user_id.

    This dependency verifies the JWT token from the Authorization header
    and extracts the user_id (sub claim) from the token payload.

    In TEST_MODE, the token signature is not verified (for demo purposes).

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        str: The authenticated user's ID (extracted from 'sub' claim)

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        if TEST_MODE:
            # In test mode, decode without verification (for demo)
            # Extract payload from JWT (format: header.payload.signature)
            parts = token.split('.')
            if len(parts) != 3:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token format",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Decode payload (add padding if needed)
            payload_b64 = parts[1]
            padding = 4 - (len(payload_b64) % 4)
            if padding != 4:
                payload_b64 += '=' * padding

            payload_json = base64.b64decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
        else:
            # Production mode: verify signature
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Extract user_id from 'sub' claim
        user_id: Optional[str] = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.InvalidTokenError, json.JSONDecodeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_user_access(user_id: str, authenticated_user_id: str) -> None:
    """Verify that the user_id in the URL matches the authenticated user.

    This prevents users from accessing other users' resources.

    Args:
        user_id: The user_id from the URL path parameter
        authenticated_user_id: The user_id extracted from the JWT token

    Raises:
        HTTPException: 403 if user_id doesn't match authenticated_user_id
    """
    if user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's resources",
        )
