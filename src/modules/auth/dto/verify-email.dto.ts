import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'The email must be a valid email address' })
  @IsNotEmpty({ message: 'The email field is required' })
  email!: string;

  @IsNotEmpty({ message: 'The verification code field is required' })
  otpCode!: string;
}
