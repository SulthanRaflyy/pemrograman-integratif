const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './user.proto';

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {keepCase: true,
   longs: String,
   enums: String,
   defaults: true,
   oneofs: true
  });

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const userService = grpcObject.UserService;

const client = new userService('localhost:50051', grpc.credentials.createInsecure());

// Get user by ID
const userId = 'abc123';
client.GetUser({id: userId}, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(response.user);
  }
});

// Create new user
const newUser = {
  name: 'John Doe',
  email: 'johndoe@example.com'
};
client.CreateUser(newUser, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(response.user);
  }
});

// Update existing user
const existingUser = {
  id: 'abc123',
  name: 'Jane Doe',
  email: 'janedoe@example.com'
};
client.UpdateUser(existingUser, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(response.user);
  }
});

// Delete user by ID
client.DeleteUser({id: userId}, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log('User deleted');
  }
});
