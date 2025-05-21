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

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadUserData(user.uid);
    loadWithdrawRequests(user.uid);
  } else {
    window.location.href = "login.html"; // إعادة التوجيه لتسجيل الدخول
  }
});

function loadUserData(uid) {
  const userRef = db.ref('users/' + uid);
  userRef.on('value', snapshot => {
    const data = snapshot.val();
    if (!data) return alert('لا توجد بيانات لهذا المستخدم');

    // عرض الكوينات - احتفظ بها في عنصر أعلى الصفحة
    document.getElementById('collected').innerText = data.coins?.collected || 0;
    document.getElementById('pendingCoins').innerText = data.coins?.pending || 0;
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

// حفظ اسم Roblox واظهار رسالة تأكيد
function checkGroup() {
  const robloxName = document.getElementById('robloxName').value.trim();
  if (!robloxName) {
    alert('من فضلك أدخل اسمك في Roblox');
    return;
  }

  db.ref('users/' + currentUser.uid).update({
    robloxName: robloxName,
    inGroup: true,
    groupJoinDate: new Date().toISOString()
  }).then(() => {
    // اظهار مربع تأكيد حفظ الاسم
    const confirmationBox = document.getElementById('confirmationBox');
    if (confirmationBox) {
      confirmationBox.style.display = 'block';
      confirmationBox.innerText = 'تم حفظ اسمك وبدء العد التنازلي بنجاح';
    }
  }).catch(error => {
    console.error('خطأ أثناء الحفظ:', error);
    alert('حدث خطأ أثناء الحفظ، حاول مرة أخرى');
  });
}

function goToTasks() {
  window.location.href = 'Task.html';
}

// تحميل سجلات طلبات السحب وعرضها في مربع منفصل
function loadWithdrawRequests(uid) {
  const recordsList = document.getElementById('withdrawRecords');
  if (!recordsList) return;

  const requestsRef = db.ref('withdrawRequests/' + uid);
  requestsRef.on('value', snapshot => {
    recordsList.innerHTML = ''; // مسح السجلات القديمة

    const requests = snapshot.val();
    if (!requests) {
      recordsList.innerHTML = '<p>لا توجد طلبات سحب حالياً.</p>';
      return;
    }

    // ترتيب حسب التاريخ تنازليًا (أحدث أولاً)
    const sortedRequests = Object.values(requests).sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    sortedRequests.forEach(req => {
      const dateString = new Date(req.date).toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const div = document.createElement('div');
      div.classList.add('record-item');
      div.innerHTML = `
        <p><strong>التاريخ:</strong> ${dateString}</p>
        <p><strong>نوع الطلب:</strong> ${req.type}</p>
        <p><strong>الكمية:</strong> ${req.amount}</p>
        <p><strong>الحالة:</strong> ${req.status}</p>
        <hr>
      `;
      recordsList.appendChild(div);
    });
  });
}
