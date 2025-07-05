"""
Secure code execution service for Code with Morais
"""
import requests
import json
import logging
import re
import io
import contextlib
import traceback
from typing import Dict, Any, Optional, List
from config import get_config
from services.code_execution import run_code

logger = logging.getLogger(__name__)
config = get_config()

# Security patterns to detect potentially dangerous code
DANGEROUS_PATTERNS = [
    r'import\s+os',
    r'import\s+sys',
    r'import\s+subprocess',
    r'import\s+socket',
    r'__import__',
    r'exec\s*\(',
    r'eval\s*\(',
    r'open\s*\(',
    r'file\s*\(',
    r'input\s*\(',
    r'raw_input\s*\('
]

def validate_code_security(code: str) -> tuple[bool, str]:
    """
    Validate code for security concerns.
    
    Args:
        code: The Python code to validate
        
    Returns:
        Tuple of (is_safe, error_message)
    """
    if not code or not isinstance(code, str):
        return False, "Code must be a non-empty string"
    
    # Check for dangerous patterns
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, code, re.IGNORECASE):
            logger.warning(f"Dangerous pattern detected: {pattern}")
            return False, f"Code contains restricted operations: {pattern}"
    
    # Check for suspicious keywords
    if any(keyword in code.lower() for keyword in ['__builtins__', '__globals__', '__locals__']):
        return False, "Code contains restricted builtin access"
    
    return True, ""

def execute_python_code(code: str, inputs: Optional[str] = None) -> Dict[str, Any]:
    """
    Execute Python code safely using a remote execution service.
    
    Args:
        code: Python code to execute
        inputs: Optional input string for the program
        
    Returns:
        Dictionary with execution results
    """
    try:
        # Validate inputs
        if not code or len(code.strip()) == 0:
            return {
                'success': False,
                'error': 'Code cannot be empty',
                'output': ''
            }
        
        # Security validation
        is_safe, error_msg = validate_code_security(code)
        if not is_safe:
            logger.warning(f"Security validation failed: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'output': ''
            }
        
        # Length validation
        if len(code) > config.MAX_CODE_LENGTH:
            return {
                'success': False,
                'error': f'Code too long (max {config.MAX_CODE_LENGTH} characters)',
                'output': ''
            }
        
        # Execute based on mode
        if config.DEV_MODE:
            return _execute_mock(code, inputs)
        else:
            return _execute_remote(code, inputs)
            
    except Exception as e:
        logger.error(f"Code execution error: {str(e)}")
        return {
            'success': False,
            'error': 'Internal execution error',
            'output': ''
        }

def _execute_mock(code: str, inputs: Optional[str]) -> Dict[str, Any]:
    """
    Mock execution for development mode with security restrictions.
    """
    try:
        # Very limited namespace for safety
        safe_builtins = {
            'print': print,
            'len': len,
            'range': range,
            'str': str,
            'int': int,
            'float': float,
            'list': list,
            'dict': dict,
            'bool': bool,
            'abs': abs,
            'max': max,
            'min': min,
            'sum': sum,
            'round': round
        }
        
        namespace = {
            '__builtins__': safe_builtins,
            '__name__': '__main__'
        }
        
        # Capture output
        import io
        import contextlib
        
        output_buffer = io.StringIO()
        
        with contextlib.redirect_stdout(output_buffer):
            # Execute with timeout simulation
            exec(code, namespace)
        
        output = output_buffer.getvalue()
        
        logger.info("Mock code execution successful")
        return {
            'success': True,
            'output': output or 'Code executed successfully (no output)',
            'error': None
        }
        
    except Exception as e:
        logger.warning(f"Mock execution error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'output': ''
        }

def _execute_remote(code: str, inputs: Optional[str]) -> Dict[str, Any]:
    """
    Execute code using remote Piston API service.
    """
    try:
        # Get latest Python version from Piston
        try:
            runtimes_response = requests.get(
                'https://emkc.org/api/v2/piston/runtimes',
                timeout=5
            )
            runtimes_response.raise_for_status()
            runtimes = runtimes_response.json()
            
            python_runtime = next(
                (rt for rt in runtimes if rt['language'] == 'python'),
                None
            )
            version = python_runtime['version'] if python_runtime else "3.10.0"
            
        except Exception as e:
            logger.warning(f"Failed to fetch Python version: {str(e)}")
            version = "3.10.0"  # Fallback
        
        # Prepare execution request
        payload = {
            "language": "python",
            "version": version,
            "files": [{"name": "main.py", "content": code}]
        }
        
        if inputs:
            payload["stdin"] = inputs
        
        # Execute with timeout
        response = requests.post(
            config.PISTON_API_URL + '/execute',
            json=payload,
            timeout=10  # 10 second timeout
        )
        response.raise_for_status()
        
        result = response.json()
        run_result = result.get('run', {})
        
        # Check for compilation errors
        if result.get('compile', {}).get('stderr'):
            return {
                'success': False,
                'error': result['compile']['stderr'],
                'output': ''
            }
        
        # Extract output and errors
        stdout = run_result.get('stdout', '').strip()
        stderr = run_result.get('stderr', '').strip()
        
        if stderr:
            logger.info("Code execution completed with errors")
            return {
                'success': False,
                'error': stderr,
                'output': stdout
            }
        else:
            logger.info("Remote code execution successful")
            return {
                'success': True,
                'output': stdout or 'Code executed successfully (no output)',
                'error': None
            }
            
    except requests.exceptions.Timeout:
        logger.error("Code execution timeout")
        return {
            'success': False,
            'error': 'Code execution timed out',
            'output': ''
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error during code execution: {str(e)}")
        return {
            'success': False,
            'error': 'Code execution service unavailable',
            'output': ''
        }
    except Exception as e:
        logger.error(f"Remote execution error: {str(e)}")
        return {
            'success': False,
            'error': 'Code execution failed',
            'output': ''
        }
