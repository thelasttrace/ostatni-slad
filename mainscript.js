// mainscript.js
import { db, auth } from './firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const blogSection = document.getElementById('blogSection');

let floatingAddButton = null;
let floatingLogoutButton = null;
let floatingDeleteAllButton = null;

// Sekwencja klawiszy "osadmin" otwiera modal logowania
const keySequence = ['o', 's', 'a', 'd', 'm', 'i', 'n'];
let currentIndex = 0;
document.addEventListener('keydown', (event) => {
  if(event.key.toLowerCase() === keySequence[currentIndex]) {
    currentIndex++;
    if(currentIndex === keySequence.length) {
      loginModal.style.display = 'flex';
      currentIndex = 0;
    }
  } else {
    currentIndex = 0;
  }
});

if(closeModal) {
  closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
}

// Logowanie przez Firebase Auth
if(loginBtn) {
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        loginModal.style.display = 'none';
      })
      .catch(error => {
        alert('Błędne dane logowania: ' + error.message);
      });
  });
}

// Wyświetlanie przycisku "Dodaj", "Wyloguj" i "Usuń wszystkie"
function showAdminButtons() {
  if(floatingAddButton || floatingLogoutButton || floatingDeleteAllButton) return;

  floatingAddButton = document.createElement('button');
  floatingAddButton.textContent = 'Dodaj';
  Object.assign(floatingAddButton.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 20px',
    background: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    zIndex: '1001'
  });

  floatingLogoutButton = document.createElement('button');
  floatingLogoutButton.textContent = 'Wyloguj';
  Object.assign(floatingLogoutButton.style, {
    position: 'fixed',
    bottom: '70px',
    right: '20px',
    padding: '10px 20px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    zIndex: '1001'
  });

  floatingDeleteAllButton = document.createElement('button');
  floatingDeleteAllButton.textContent = 'Usuń wszystkie';
  Object.assign(floatingDeleteAllButton.style, {
    position: 'fixed',
    bottom: '120px',
    right: '20px',
    padding: '10px 20px',
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    zIndex: '1001'
  });

  document.body.appendChild(floatingAddButton);
  document.body.appendChild(floatingLogoutButton);
  document.body.appendChild(floatingDeleteAllButton);

  floatingAddButton.addEventListener('click', showAddArticleForm);
  floatingLogoutButton.addEventListener('click', () => signOut(auth));
  floatingDeleteAllButton.addEventListener('click', deleteAllArticles);
}

// Usuń wszystkie artykuły
async function deleteAllArticles() {
  if (!confirm('Czy na pewno chcesz usunąć wszystkie artykuły?')) return;
  try {
    const q = query(collection(db, "articles"));
    const querySnapshot = await getDocs(q);
    const deletions = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletions);
    alert('Wszystkie artykuły zostały usunięte.');
    loadArticles();
  } catch (error) {
    alert('Błąd przy usuwaniu: ' + error.message);
  }
}

// Formularz dodawania artykułu
function showAddArticleForm() {
  if(document.getElementById('articleForm')) return;

  const form = document.createElement('div');
  form.id = 'articleForm';
  form.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: #fff; padding: 20px; border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.3); z-index: 2000; width: 320px;
  `;

  form.innerHTML = `
    <h3>Dodaj nowy artykuł</h3>
    <input type="text" id="titleInput" placeholder="Tytuł" style="width: 100%; margin-bottom: 10px;" />
    <input type="date" id="dateInput" style="width: 100%; margin-bottom: 10px;" />
    <input type="text" id="thumbInput" placeholder="Link do miniaturki" style="width: 100%; margin-bottom: 10px;" />
    <textarea id="contentInput" placeholder="Treść artykułu" style="width: 100%; height: 100px; margin-bottom: 10px;"></textarea>
    <button id="saveArticleBtn" style="margin-right: 10px;">Zapisz</button>
    <button id="cancelArticleBtn">Anuluj</button>
  `;

  document.body.appendChild(form);

  document.getElementById('cancelArticleBtn').addEventListener('click', () => {
    form.remove();
  });

  document.getElementById('saveArticleBtn').addEventListener('click', async () => {
    const title = document.getElementById('titleInput').value.trim() || 'Brak tytułu';
    const date = document.getElementById('dateInput').value || new Date().toISOString().split('T')[0];
    const thumb = document.getElementById('thumbInput').value.trim() || 'https://via.placeholder.com/400x200?text=Brak+miniaturki';
    const content = document.getElementById('contentInput').value.trim() || 'Brak treści';

    const post = document.createElement('div');
    post.classList.add('post');
    post.style.margin = '20px';
    post.style.border = '1px solid #ccc';
    post.style.padding = '15px';
    post.style.borderRadius = '8px';
    post.style.boxShadow = '0 0 5px rgba(0,0,0,0.1)';

    post.innerHTML = `
      <div class="post-thumbnail" style="margin-bottom: 10px;">
        <img src="${thumb}" alt="Miniaturka" style="max-width: 100%; height: auto; border-radius: 6px;" />
      </div>
      <h2>${title}</h2>
      <p><em>${date}</em></p>
      <p>${content}</p>
    `;

    blogSection.prepend(post);

    try {
      await addDoc(collection(db, "articles"), {
        title,
        date,
        imgSrc: thumb,
        content
      });
      alert('Artykuł został dodany!');
      document.getElementById('articleForm').remove();
    } catch (e) {
      alert('Błąd przy zapisie artykułu: ' + e.message);
      console.error(e);
      post.remove();
    }
  });
}

// Ładowanie artykułów
async function loadArticles() {
  blogSection.innerHTML = 'Ładowanie...';

  try {
    const q = query(collection(db, "articles"), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    blogSection.innerHTML = '';

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const post = document.createElement('div');
      post.classList.add('post');
      post.style.margin = '20px';
      post.style.border = '1px solid #ccc';
      post.style.padding = '15px';
      post.style.borderRadius = '8px';
      post.style.boxShadow = '0 0 5px rgba(0,0,0,0.1)';

      post.innerHTML = `
        <div class="post-thumbnail" style="margin-bottom: 10px;">
          <img src="${data.imgSrc}" alt="Miniaturka" style="max-width: 100%; height: auto; border-radius: 6px;" />
        </div>
        <h2>${data.title}</h2>
        <p><em>${data.date}</em></p>
        <p>${data.content}</p>
      `;

      blogSection.appendChild(post);
    });

    if (querySnapshot.empty) {
      blogSection.textContent = 'Brak artykułów do wyświetlenia.';
    }
  } catch (e) {
    blogSection.textContent = 'Błąd przy ładowaniu artykułów: ' + e.message;
  }
}

// Obsługa stanu logowania
onAuthStateChanged(auth, (user) => {
  if(user) {
    showAdminButtons();
  } else {
    if(floatingAddButton) floatingAddButton.remove(), floatingAddButton = null;
    if(floatingLogoutButton) floatingLogoutButton.remove(), floatingLogoutButton = null;
    if(floatingDeleteAllButton) floatingDeleteAllButton.remove(), floatingDeleteAllButton = null;
  }
});

// Start
loadArticles();
