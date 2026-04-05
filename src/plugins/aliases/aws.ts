import type { PluginManifest } from '../types.js'

export const plugin: PluginManifest = {
  name: "aws",
  version: '1.0.0',
  description: "AWS CLI aliases (ported from oh-my-zsh)",
  aliases: {
    "awsl": "aws configure list",
    "awsp": "aws configure list-profiles",
    "awss3": "aws s3",
    "awss3ls": "aws s3 ls",
    "awsec2": "aws ec2 describe-instances",
    "awslogs": "aws logs",
    "awseks": "aws eks",
    "awsiam": "aws iam",
    "awslambda": "aws lambda",
    "awscf": "aws cloudformation",
  },
}
