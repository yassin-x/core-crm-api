import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString({ message: 'The company name must be a string' })
  @IsNotEmpty({ message: 'The company name field is required' })
  name!: string;

  @IsEmail({}, { message: 'The email must be a valid email address' })
  @IsNotEmpty({ message: 'The email field is required' })
  email!: string;

  @IsString({ message: 'phone must be a string' })
  @IsNotEmpty({ message: 'The phone field is required' })
  phone!: string;

  @IsNotEmpty({ message: 'The company name field is required' })
  companyName!: string;
}
