const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const admin = require('firebase-admin');

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

const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('Server started, listening: 0.0.0.0:50051');
  });
// console.log('Server started, listening: 0.0.0.0:50051');
