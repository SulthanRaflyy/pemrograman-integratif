// mengimpor library gRPC untuk Node.js.
const grpc = require('@grpc/grpc-js');
// mengimpor library protoLoader untuk membaca file proto.
const protoLoader = require('@grpc/proto-loader');

// menentukan path dari file user.proto.
const PROTO_PATH = './user.proto';

// membaca file user.proto dan mengembalikan definisi package dari proto tersebut dalam bentuk JavaScript.
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {keepCase: true,
   longs: String,
   enums: String,
   defaults: true,
   oneofs: true
  });


// mengambil definisi package dan mengembalikan objek gRPC.
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// mengambil definisi service yang telah didefinisikan pada file .proto.
const userService = grpcObject.UserService; 

// mengambil definisi service yang telah didefinisikan pada file .proto.
const client = new userService('localhost:50051', grpc.credentials.createInsecure());

// Get user by ID

// mendefinisikan variabel userId yang digunakan sebagai parameter untuk pemanggilan fungsi GetUser.
const userId = 'a1p2i3';

// memanggil fungsi GetUser pada server dengan parameter {id: userId}. Jika ada error, maka error akan ditampilkan pada konsol. Jika tidak, maka response dari server akan ditampilkan pada konsol.
client.GetUser({id: userId}, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(response.user);
  }
});

// Create new user

// mendefinisikan variabel newUser yang digunakan sebagai parameter untuk pemanggilan fungsi CreateUser.
const newUser = {
  name: 'Apiii',
  email: 'api@gmail.com'
};

// memanggil fungsi CreateUser pada server dengan parameter newUser. Jika ada error, maka error akan ditampilkan pada konsol. Jika tidak, maka response dari server akan ditampilkan pada konsol.
client.CreateUser(newUser, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(response.user);
  }
});

// Update existing user

// mendefinisikan variabel existingUser yang digunakan sebagai parameter untuk pemanggilan fungsi UpdateUser.
const existingUser = {
  id: 'a1p2i3',
  name: 'Aaapppiii',
  email: 'aaapppiii@example.com'
};


// memanggil fungsi UpdateUser pada server dengan parameter existingUser. Jika ada error, maka error akan ditampilkan pada konsol. Jika tidak, maka response dari server akan ditampilkan pada konsol.
client.UpdateUser(existingUser, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(response.user);
  }
});

// Delete user by ID

// memanggil fungsi DeleteUser pada server dengan parameter {id: userId}. Jika ada error, maka error akan ditampilkan pada konsol. Jika tidak, maka akan menampilkan pesan "User deleted" pada konsol.
client.DeleteUser({id: userId}, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log('User deleted');
  }
});
