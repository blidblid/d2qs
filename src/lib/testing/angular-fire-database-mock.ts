export class AngularFireDatabaseMock {
  database = {
    ref: () => {
      return {
        onDisconnect: () => {
          return {
            remove: () => Promise.resolve(),
          };
        },
      };
    },
  };
}
