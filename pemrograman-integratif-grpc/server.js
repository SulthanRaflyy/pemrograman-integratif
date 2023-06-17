const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const admin = require('firebase-admin');

const PROTO_PATH = './user.proto';

// membaca file .proto dan menghasilkan definisi package dari protokol tersebut dalam bentuk JavaScript.
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

// membaca file konfigurasi Firebase.
const serviceAccount = require('./firebase-key.json');


// inisialisasi Firebase Admin SDK dengan konfigurasi yang telah dibaca pada langkah sebelumnya.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// membuat instance server dari objek gRPC.
const server = new grpc.Server();

server.addService(userService.service, {
  GetUser: function(call, callback) {
    const id = call.request.id;
    admin.firestore().collection('users').doc(id).get()
      .then(doc => {
        if (!doc.exists) {
          callback({
            code: grpc.status.NOT_FOUND,
            details: 'User not found'
          });
        } else {
          const user = doc.data();
          user.id = doc.id;
          callback(null, {user: user});
        }
      })
      .catch(err => {
        console.error(err);
        callback({
          code: grpc.status.INTERNAL,
          details: 'Internal error'
        });
      });
  },

  CreateUser: function(call, callback) {
    const user = call.request;
    user.created_at = new Date();
    user.updated_at = new Date();
    admin.firestore().collection('users').add(user)
      .then(docRef => {
        user.id = docRef.id;
        callback(null, {user: user});
      })
      .catch(err => {
        console.error(err);
        callback({
          code: grpc.status.INTERNAL,
          details: 'Internal error'
        });
      });
  },

  UpdateUser: function(call, callback) {
    const user = call.request;
    user.updated_at = new Date();
    admin.firestore().collection('users').doc(user.id).set(user, {merge: true})
      .then(() => {
        callback(null, {user: user});
      })
      .catch(err => {
        console.error(err);
        callback({
          code: grpc.status.INTERNAL,
          details: 'Internal error'
        });
      });
  },

  DeleteUser: function(call, callback) {
    const id = call.request.id;
    admin.firestore().collection('users').doc(id).delete()
      .then(() => {
        callback(null, {});
      })
      .catch(err => {
        console.error(err);
        callback({
          code: grpc.status.INTERNAL,
          details: 'Internal error'
        });
      });
  },

  ListUsers: function(call, callback) {
    admin.firestore().collection('users').get()
      .then(snapshot => {
        const users = [];
        snapshot.forEach(doc => {
          const user = doc.data();
          user.id = doc.id;
          users.push(user);
        });
        const message = { users: users };
        console.log(JSON.stringify(message, null, 2));
        callback(null, message);
      })
      .catch(err => {
        console.error(err);
        callback({
          code: grpc.status.INTERNAL,
          details: 'Internal error'
        });
      });
  }
  
});

// mengikat server pada port 50051 dan memulai listen untuk menerima permintaan dari client.
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('Server started, listening: 0.0.0.0:50051');
  });
// console.log('Server started, listening: 0.0.0.0:50051');
