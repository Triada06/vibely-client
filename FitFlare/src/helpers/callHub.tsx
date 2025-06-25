import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export interface CallHubCallbacks {
  onIncomingCall: (callerId: string) => void;
  onReceiveOffer: (userId: string, offer: string, isVideoCall: boolean) => void;
  onReceiveAnswer: (userId: string, answer: string) => void;
  onReceiveIceCandidate: (userId: string, candidate: string) => void;
  onCallEnded: (userId: string) => void;
}

export const startCallConnection = (
  token: string,
  callbacks: CallHubCallbacks
) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7014/hubs/call", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("IncomingCall", (callerId: string) => {
    callbacks.onIncomingCall(callerId);
  });

  connection.on(
    "ReceiveOffer",
    (userId: string, offer: string, isVideoCall: boolean) => {
      callbacks.onReceiveOffer(userId, offer, isVideoCall);
    }
  );

  connection.on("ReceiveAnswer", (userId: string, answer: string) => {
    callbacks.onReceiveAnswer(userId, answer);
  });

  connection.on("ReceiveIceCandidate", (userId: string, candidate: string) => {
    callbacks.onReceiveIceCandidate(userId, candidate);
  });

  connection.on("CallEnded", (userId: string) => {
    callbacks.onCallEnded(userId);
  });

  connection
    .start()
    .catch((err) => console.error("SignalR CallHub Connection Error: ", err));
};

export const callUser = (targetUserId: string) => {
  if (connection) {
    connection
      .invoke("CallUser", targetUserId)
      .catch((err) => console.error(err));
  }
};

export const sendOffer = (
  targetUserId: string,
  offer: string,
  isVideoCall: boolean
) => {
  if (connection) {
    connection
      .invoke("SendOffer", targetUserId, offer, isVideoCall)
      .catch((err) => console.error(err));
  }
};

export const sendAnswer = (targetUserId: string, answer: string) => {
  if (connection) {
    connection
      .invoke("SendAnswer", targetUserId, answer)
      .catch((err) => console.error(err));
  }
};

export const sendIceCandidate = (targetUserId: string, candidate: string) => {
  if (connection) {
    connection
      .invoke("SendIceCandidate", targetUserId, candidate)
      .catch((err) => console.error(err));
  }
};

export const endCall = (targetUserId: string) => {
  if (connection) {
    connection
      .invoke("EndCall", targetUserId)
      .catch((err) => console.error(err));
  }
};
