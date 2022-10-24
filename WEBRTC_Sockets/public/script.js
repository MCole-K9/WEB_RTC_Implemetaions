
let servers = {
    iceServers:[
        {
            urls:['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }
    ]
}

const pc =  new RTCPeerConnection(servers)

const socket = io('/');

let localStream;
let remoteStream = new MediaStream();


socket.emit('join-room', ROOM_ID, 10);

const webcamButton = document.getElementById('webcamButton');
const callBtn = document.getElementById('start-call');
const webcamVideo = document.getElementById('my-video');
const remoteVideo = document.getElementById('remote-video');
const joinCallBtn = document.getElementById('join-call');

remoteVideo.srcObject = remoteStream;

pc.ontrack = async (event) => {
    event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
}

callBtn.addEventListener('click', async () => {
    //alert('call button clicked');


    const offer  = await pc.createOffer()

    await pc.setLocalDescription(offer)

    pc.onicecandidate = (event) => {
        if(event.candidate) {

          //this is should be sent to the other peer to add to their peer connection 
           socket.emit("offerUpdated", ROOM_ID , JSON.stringify(pc.localDescription)) ;
        }
    }


   
})

webcamButton.addEventListener('click', async () => {
            
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});


    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    webcamVideo.srcObject = localStream;

})

joinCallBtn.addEventListener('click', async () => {
   
    let answer = await pc.createAnswer();

    await pc.setLocalDescription(answer);



    socket.emit('joining', ROOM_ID ,JSON.stringify(answer));
    

})


socket.on('user-connected', userId => {
    console.log('User connected: ' + userId);
})

socket.on("updateOffer", async (remoteOffer) =>{

    console.log(remoteOffer, "remoteOffer");
   await pc.setRemoteDescription( new RTCSessionDescription(JSON.parse(remoteOffer)));
   

})

socket.on("answered", async (answer) => {
   

    await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
    
    
})