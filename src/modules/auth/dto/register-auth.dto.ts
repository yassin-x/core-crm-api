import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterAuthDto {
  @IsEmail({}, { message: 'The email must be a valid email address' })
  @IsNotEmpty({ message: 'The email field is required' })
  email!: string;

  @IsString({
    message: 'The password must be a string',
  })
  @MaxLength(16, {
    message: 'The password must be at most 16 characters long',
  })
  @MinLength(8, {
    message: 'The password must be at least 8 characters long',
  })
  @IsNotEmpty({ message: 'The password field is required' })
  password!: string;

  @IsString({
    message: 'phone must be a string',
  })
  @MaxLength(11, {
    message: 'phone must be at most 11 characters long',
  })
  @MinLength(10, {
    message: 'phone must be at least 10 characters long',
  })
  @IsNotEmpty({ message: 'The phone field is required' })
  phone!: string;

  @IsString({
    message: 'The company name must be a string',
  })
  @IsNotEmpty({ message: 'The company name field is required' })
  companyName!: string;
}
