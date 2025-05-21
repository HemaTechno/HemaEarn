const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
emailjs.init("YOUR_EMAILJS_USER_ID");

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
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
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
