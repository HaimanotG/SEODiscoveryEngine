import { IsString, IsNumber, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateAnalysisJobDto {
  @IsNumber()
  @IsNotEmpty()
  domainId: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  htmlContent: string;
}