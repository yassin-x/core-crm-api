import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginAuthDto {
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
}
