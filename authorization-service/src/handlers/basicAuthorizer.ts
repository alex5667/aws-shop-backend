import { APIGatewayTokenAuthorizerEvent, Callback, Context } from 'aws-lambda';

const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string,
) => {
  const policy = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: {},
  };

  return policy;
};

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ctx: Context,
  cb: Callback,
) => {
  const { authorizationToken } = event;
  console.log('BasicAuthorizer:', JSON.stringify(event));

  if (!authorizationToken) {
    cb('Unauthorized');
  }

  try {
    const [authType, encodedCredentials] = authorizationToken.split(' ');
    console.log('authType:', authType);
    console.log('encodedCredentials:', encodedCredentials);

    if (authType !== 'Basic' || !encodedCredentials) {
      cb('Unauthorized');
    }

    const decodedCredentials = Buffer.from(encodedCredentials, 'base64')
      .toString('utf-8')
      .trim();

    console.log('decodedCredentials:', decodedCredentials);

    const [username, password] = decodedCredentials
      .split(':')
      .map((part) => part.trim());
    console.log('username:', username);
    console.log('password:', password);
    const storedPassword = process.env[username.toLowerCase()];
    console.log('storedPassword:', storedPassword);
    console.log('vs:', storedPassword === password);
    console.log('storedPasswordL:', storedPassword?.length);
    console.log('passwordL:', password?.length);

    console.log('typeof storedPassword:', typeof storedPassword);
    console.log('typeof password:', typeof storedPassword);

    const effect =
      storedPassword && storedPassword === password ? 'Allow' : 'Deny';
    const policy = generatePolicy(decodedCredentials, effect, event.methodArn);
    console.log('effect:', effect);
    console.log('policy:', policy);

    cb(null, policy);
  } catch (error) {
    const errorMsg =
      (error instanceof Error && error.message) || 'Unknown error';

    cb(`Unauthorized: ${errorMsg}`);
  }
};
