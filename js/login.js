const firebaseConfig = {
  apiKey: "AIzaSyAX8PWbKfWeBYzmX7sdrBhIT0Wp1yPjR04",
  authDomain: "hemaern.firebaseapp.com",
  databaseURL: "https://hemaern-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hemaern",
  storageBucket: "hemaern.firebasestorage.app",
  messagingSenderId: "533729874483",
  appId: "1:533729874483:web:142462fdbd96156fe30946"
};

firebase.initializeApp(firebaseConfig);
emailjs.init("sCPwwv_HxKqZ4Cv3X");

function emailLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => alert("تم تسجيل الدخول"))
    .catch((err) => alert(err.message));
}

function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then((result) => {
    const user = result.user;
    sendVerificationCode(user.email);
  }).catch((error) => {
    alert(error.message);
  });
}

let generatedCode = "";
function sendVerificationCode(email) {
  generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById("verification-box").style.display = "block";
  emailjs.send("service_xum3xhh", "template_pq1zshc", {
    to_email: email,
    message: generatedCode
  }).then(() => {
    alert("تم إرسال كود التحقق إلى بريدك الإلكتروني");
  });
}

function verifyCode() {
  const inputCode = document.getElementById("verificationCode").value;
  if (inputCode === generatedCode) {
    alert("تم التحقق بنجاح!");
    window.location.href = "levels.html"; // بعد التحقق يذهب للمراحل
  } else {
    alert("كود غير صحيح!");
  }
}
