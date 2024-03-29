const books = [];
const RENDER_EVENT = "render-book";

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  const searchBar = document.querySelector(".search-bar input");
  const searchBtn = document.querySelector(".search-bar button");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  searchBtn.addEventListener("click", function () {
    filterBook(searchBar.value);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedReadList = document.getElementById("unread");
  uncompletedReadList.innerHTML = "";

  const completedReadList = document.getElementById("read");
  completedReadList.innerHTML = "";

  for (const book of books) {
    const bookElement = makeBook(book);
    if (!book.isComplete) {
      uncompletedReadList.innerHTML += bookElement;
    } else completedReadList.innerHTML += bookElement;
  }
});

function filterBook(title) {
  const uncompletedReadList = document.getElementById("unread");
  uncompletedReadList.innerHTML = "";

  const completedReadList = document.getElementById("read");
  completedReadList.innerHTML = "";
  for (const book of books) {
    if (book.title.includes(title)) {
      const bookElement = makeBook(book);
      if (!book.isComplete) {
        uncompletedReadList.innerHTML += bookElement;
      } else completedReadList.innerHTML += bookElement;
    }
  }
}

function addBook() {
  const titleElement = document.getElementById("title");
  const title = document.getElementById("title").value;
  const authorElement = document.getElementById("author");
  const author = document.getElementById("author").value;
  const yearElement = document.getElementById("year");
  const year = yearElement.value;

  const isNumeric = !isNaN(parseFloat(year)) && isFinite(year);
  if (title === "") {
    titleElement.classList.add("border-danger");
    titleElement.value = "";
    titleElement.setAttribute("placeholder", "Judul harus diisi");
    return;
  }
  if (author === "") {
    authorElement.classList.add("border-danger");
    authorElement.value = "";
    authorElement.setAttribute("placeholder", "Penulis harus diisi");
    return;
  }
  if (!isNumeric) {
    yearElement.classList.add("border-danger");
    yearElement.value = "";
    yearElement.setAttribute("placeholder", "Tahun harus berupa angka");
    return;
  }

  const radio = document.querySelector("input[name='btnradio']:checked").value;
  const isRead = radio === "true" ? true : false;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    isRead
  );

  books.push(bookObject);

  titleElement.classList.remove("border-danger");
  titleElement.setAttribute("placeholder", "Contoh : Harry Potter");
  authorElement.classList.remove("border-danger");
  authorElement.setAttribute("placeholder", "Contoh : J.K Rowling");
  yearElement.classList.remove("border-danger");
  yearElement.setAttribute("placeholder", "Contoh : 2011");

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function makeBook(bookObject) {
  const readButton = `<a class="btn btn-primary m-1" onclick="addBookToComplete(${bookObject.id})">Sudah dibaca</a>`;
  const unreadButton = `<a class="btn btn-primary m-1" onclick="undoBookFromComplete(${bookObject.id})">Belum dibaca</a>`;
  const deleteButton = `<a href="#popup" class="btn btn-danger m-1" onclick="openDialog(${bookObject.id}, '${bookObject.title}' )">Hapus</a>`;
  const bookCard = `<div class="col-sm-6 mb-3">
  <div class="card shadow" id="book-${bookObject.id}">
    <div class="card-body">
      <h4 class="book-title">${bookObject.title}</h4>
      <p class="book-author">
        Penerbit :${bookObject.author} <br />
        tahun Terbit : ${bookObject.year}
      </p>
      ${
        bookObject.isComplete
          ? unreadButton + deleteButton
          : readButton + deleteButton
      }
      
    </div>
  </div>
</div>`;

  return bookCard;
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function openDialog(id, title) {
  document.body.classList.add("no-scroll");
  const dialogContainer = document.getElementById("popup");
  console.log(dialogContainer);
  dialogContainer.classList.add("open-dialog");
  const h3 = dialogContainer.getElementsByTagName("h3");
  h3[0].innerHTML = `Apakah anda yakin ingin menghapus buku ${title}`;
  const btn = dialogContainer.getElementsByTagName("button");
  btn[0].addEventListener("click", function () {
    deleteBook(id);
    closeDialog();
  });
  btn[1].addEventListener("click", function () {
    closeDialog();
  });
}

function closeDialog() {
  const dialogContainer = document.getElementById("popup");
  dialogContainer.classList.remove("open-dialog");
  document.body.classList.remove("no-scroll");
}
