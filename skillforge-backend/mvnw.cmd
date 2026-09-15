@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set WRAPPER_JAR="%~dp0\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%~dp0\.mvn\wrapper\maven-wrapper.properties"

@REM Use installed Maven if wrapper jar is invalid
where mvn >nul 2>nul
if %errorlevel% equ 0 (
    mvn %*
) else (
    echo Maven is not installed and wrapper jar is not available.
    echo Please install Maven from https://maven.apache.org/download.cgi
    exit /b 1
)

:end
