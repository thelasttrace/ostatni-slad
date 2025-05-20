let keySequence = ['o', 's', 'a', 'd', 'm', 'i', 'n'];
let currentIndex = 0;

document.addEventListener('keydown', function (event) {
  if (event.key.toLowerCase() === keySequence[currentIndex]) {
    currentIndex++;
    if (currentIndex === keySequence.length) {
      const modal = document.getElementById('loginModal');
      if (modal) modal.style.display = 'flex';
      currentIndex = 0;
    }
  } else {
    currentIndex = 0;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const loginModal = document.getElementById('loginModal');
  const loginBtn = document.getElementById('loginBtn');
  const closeModal = document.getElementById('closeModal');
  const blogSection = document.getElementById('blogSection');

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      loginModal.style.display = 'none';
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('loggedIn', 'true');
        if (!window.location.href.includes('blog.html')) {
          window.location.href = 'blog.html';
        } else {
          loginModal.style.display = 'none';
          showAddButton();
        }
      } else {
        alert('Błędne dane logowania');
      }
    });
  }

  function showAddButton() {
    if (document.getElementById('floatingAddButton')) return;

    const buttonAdd = document.createElement('button');
    buttonAdd.id = 'floatingAddButton';
    buttonAdd.textContent = 'Dodaj';
    Object.assign(buttonAdd.style, {
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

    const buttonDeleteAll = document.createElement('button');
    buttonDeleteAll.id = 'floatingDeleteAllButton';
    buttonDeleteAll.textContent = 'Usuń wszystkie';
    Object.assign(buttonDeleteAll.style, {
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

    buttonAdd.addEventListener('click', () => {
      const newPost = document.createElement('div');
      newPost.classList.add('post');
      const date = new Date().toISOString().split('T')[0];

      newPost.innerHTML = `
        <div class="post-thumbnail">
          <label style="cursor:pointer;">
            <img src="placeholder.jpg" alt="Kliknij, aby dodać obraz" style="max-width: 300px;" />
            <input type="file" accept="image/*" style="display:none;" />
          </label>
        </div>
        <div class="post-content">
          <div class="post-title" contenteditable="true">Kliknij, aby edytować tytuł</div>
          <p contenteditable="true">Kliknij, aby edytować treść...</p>
          <div style="margin-top:10px;">
            <button class="savePostBtn">Zapisz</button>
          </div>
        </div>
      `;

      const fileInput = newPost.querySelector('input[type="file"]');
      const image = newPost.querySelector('img');
      fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            image.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      const saveBtn = newPost.querySelector('.savePostBtn');
      saveBtn.addEventListener('click', () => {
        const title = newPost.querySelector('.post-title').innerHTML;
        const content = newPost.querySelector('p').innerHTML;
        const imgSrc = newPost.querySelector('img').src;
        const date = new Date().toISOString().split('T')[0];

        const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        savedPosts.unshift({ title, content, imgSrc, date });
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
        alert("Zapisano artykuł");
        location.reload(); // przeładuj stronę, aby od razu wczytać kafelek
      });

      blogSection?.prepend(newPost);
    });

    buttonDeleteAll.addEventListener('click', () => {
      localStorage.setItem('savedPosts', '[]');
      blogSection.innerHTML = '';
      alert("Wszystkie artykuły zostały usunięte");
    });

    document.body.appendChild(buttonAdd);
    document.body.appendChild(buttonDeleteAll);
  }

function loadPosts() {
  const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');

  savedPosts.forEach(post => {
    const newPost = document.createElement('div');
    newPost.classList.add('post');
    newPost.style.cursor = 'pointer';

    newPost.innerHTML = `
      <div class="post-thumbnail">
        <img src="${post.imgSrc}" alt="Miniaturka" class="thumbnail-image" />
      </div>
      <div class="post-content">
        <div class="post-title">${post.title}</div>
        <p class="post-date">${post.date}</p>
      </div>
    `;

    newPost.addEventListener('click', () => {
      localStorage.setItem('currentPost', JSON.stringify(post));
      window.location.href = 'post1.html';
    });

    if (blogSection) blogSection.appendChild(newPost);
  });
}


  if (localStorage.getItem('loggedIn') === 'true' && window.location.href.includes('blog.html')) {
    showAddButton();
  }

  loadPosts();

  const postContent = currentPost.content.replace(/\n/g, '<br>');
document.getElementById('articleContent').innerHTML = postContent;

document.getElementById('backButton').addEventListener('click', () => {
  window.location.href = 'blog.html';
});

});
