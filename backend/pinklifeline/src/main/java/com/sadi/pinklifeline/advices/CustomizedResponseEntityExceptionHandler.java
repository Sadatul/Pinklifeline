package com.sadi.pinklifeline.advices;

import com.sadi.pinklifeline.exceptions.*;
import com.sadi.pinklifeline.models.responses.ErrorDetails;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDate;

@ControllerAdvice
public class CustomizedResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(Exception.class)
    public final ResponseEntity<ErrorDetails> handleAllException(Exception ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler({UserAlreadyExistsException.class, OtpMismatchException.class, UnverifiedResourceException.class, BadRequestFromUserException.class})
    public final ResponseEntity<ErrorDetails> handleBadRequestException(Exception ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({UsernameNotFoundException.class, ChatRoomNotFoundException.class, ResourceNotFoundException.class})
    public final ResponseEntity<ErrorDetails> handleNotFoundException(Exception ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({BadCredentialsException.class})
    public final ResponseEntity<ErrorDetails> handleUnauthorizedException(Exception ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler({UserRegistrationAlreadyCompleteException.class, UserInfoUnregisteredException.class, AuthorizationDeniedException.class})
    public final ResponseEntity<ErrorDetails> handleForbiddenException(Exception ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler({OtpTimedOutException.class})
    public final ResponseEntity<ErrorDetails> handleTimeOutExceptions(Exception ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.REQUEST_TIMEOUT);
    }

    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request)
    {
        ErrorDetails errorDetails = new ErrorDetails(LocalDate.now(), ex.getMessage(),
                request.getDescription(false));
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }
}