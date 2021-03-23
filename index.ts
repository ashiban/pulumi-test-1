import { USEast1Region } from "@pulumi/aws";
import aws = require("@pulumi/aws");
import * as docker from '@pulumi/docker'
import { Repository } from "@pulumi/aws/ecr";

const stageName = "stage"
const REGION = USEast1Region // "us-east-1"
const NAME = "dockertest"


const lambdaExecRole = new aws.iam.Role(`${NAME}_lambdaExecRole`, {
    assumeRolePolicy: {
       Version: "2012-10-17",
       Statement: [{
          Action: "sts:AssumeRole",
          Principal: {
             Service: "lambda.amazonaws.com",
          },
          Effect: "Allow",
          Sid: "",
       }],
    },
})
 new aws.iam.RolePolicyAttachment("lambdaExecRoleAttach", {
    role: lambdaExecRole,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaFullAccess,
})



let repo = new Repository(NAME + "repo")

let additionalFolders = []


let helloservice_envVars = {}
helloservice_envVars = {

    variables: {
        "thundra_agent_lambda_debugger_auth_token": "E/EfFsiue6p4SCegWFF1x5zq9HbquY41RiWR+x1Rb64=",
        "thundra_agent_lambda_debugger_session_name": "helloservice"
    }
}

createLambdaModule("app-kjdfj3", 'app-kjdfj3', 512, helloservice_envVars);

function createLambdaModule(execUnitName, funcName, memorySize, envVars) {
    
    let dockerImage = docker.buildAndPushImage(execUnitName, `./${execUnitName}`, repo.repositoryUrl, null)
    

    let lambdaConfig = {
        packageType: "Image",
        imageUri: dockerImage,
        name: funcName,
        timeout: 900,
        memorySize: memorySize /*MB*/,
        role: lambdaExecRole.arn,
    }
    if (Object.keys(envVars).length > 0) {
        lambdaConfig["environment"] = envVars
    }

    let lambdaFunc = new aws.lambda.Function(execUnitName, lambdaConfig);

    return lambdaFunc
}
