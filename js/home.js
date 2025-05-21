// إعداد Firebase
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

const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;

// رقم الجروب في Roblox
const groupId = 11634679; // <<<< غير هذا الرقم برقم الجروب الحقيقي

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadUserData(user.uid);
  } else {
    // إذا المستخدم مش مسجل دخول
    window.location.href = "login.html";
  }
});

function loadUserData(uid) {
  const userRef = db.ref('users/' + uid);
  userRef.on('value', snapshot => {
    const data = snapshot.val();
    if (!data) return alert('لا توجد بيانات لهذا المستخدم');

    // عرض الكوينات
    document.getElementById('collected').innerText = data.coins?.collected || 0;
    document.getElementById('pending').innerText = data.coins?.pending || 0;
    document.getElementById('withdrawn').innerText = data.coins?.withdrawn || 0;

    // حالة الجروب
    if (data.inGroup) {
      document.getElementById('groupStatus').innerText = 'أنت في الجروب';
      startCountdown(data.groupJoinDate);
    } else {
      document.getElementById('groupStatus').innerText = 'أنت لست في الجروب';
      document.getElementById('countdown').innerText = '';
    }
  });
}

function startCountdown(joinDate) {
  if (!joinDate) return;
  const countdownEl = document.getElementById('countdown');
  const targetDate = new Date(joinDate);
  targetDate.setDate(targetDate.getDate() + 14);

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      countdownEl.innerText = "مدة الـ 14 يوم انتهت!";
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownEl.innerText = `العد التنازلي: ${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
}

async function checkGroup() {
  const robloxName = document.getElementById('robloxName').value.trim();
  if (!robloxName) {
    alert('من فضلك أدخل اسمك في Roblox');
    return;
  }

  try {
    const userId = await getUserIdByUsername(robloxName);
    const inGroup = await isUserInGroup(userId, groupId);

    if (inGroup) {
      alert('أنت في الجروب! سيتم تسجيل دخولك.');
      await db.ref('users/' + currentUser.uid).update({
        inGroup: true,
        groupJoinDate: new Date().toISOString()
      });
    } else {
      alert('أنت لست في الجروب');
    }
  } catch (error) {
    alert('حدث خطأ أثناء التحقق، حاول مرة أخرى');
    console.error(error);
  }
}

async function getUserIdByUsername(username) {
  const response = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
  const data = await response.json();
  if (data.Id) return data.Id;
  throw new Error('User not found');
}

async function isUserInGroup(userId, groupId) {
  const response = await fetch(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
  const data = await response.json();
  return data.data.some(group => group.id === groupId);
}

function goToTasks() {
  window.location.href = 'Task.html';
}
