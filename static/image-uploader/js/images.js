document.addEventListener('DOMContentLoaded', () => {

    const fileListWrapper = document.getElementById('file-list-wrapper');
    const uploadRedirectButton = document.getElementById('upload-tab-btn');
    const fileUpload = document.getElementById('file-upload');
    const imagesButton = document.getElementById('images-tab-btn');
    const dropzone = document.querySelector('.upload__dropzone');
    const currentUploadInput = document.querySelector('.upload__input');
    const copyButton = document.querySelector('.upload__copy');
    const imagesTab = document.getElementById('images-tab-btn');
    const uploadTab = document.getElementById('upload-tab-btn');
    const uploadForm = document.getElementById('upload-form');
    const filesWrapper = document.getElementById('file-list-wrapper');
    const prompt = document.querySelector('.no__content__prompt');
    const filesContainer = document.querySelector('.file-list-container');

    async function displayFiles(page, pageSize){
        const result = await fetch(`/get_images/?page=${page}&page_size=${pageSize}`)
        const images = await result.json();

        if (images.length !== 0) {
            prompt.style.display = 'none';
            filesContainer.style.display = 'grid';
            const list = document.getElementById('file-list');
            list.innerHTML = '';
            // TODO: set images data according to task
            images.forEach((fileData, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-list-item';
                fileItem.innerHTML = `
                    <div class="file-col file-col-name">
                        <span class="file-icon"><img src='/images/${fileData.filename}' alt="file icon"></span>
                        <span class="file-name">${fileData.filename}</span>
                    </div>
                    <div class="file-col file-col-url"><a href='http://localhost/images/${fileData.filename}' target="_blank">Link</a></div>
                    <div class="file-col file-col-delete">
                        <button class="delete-btn" onclick="fetchDelete('${fileData.filename}')">
                            <img src="/static/image-uploader/img/icon/delete.png" alt="delete icon">
                        </button>
                    </div>
                `;
                list.appendChild(fileItem);
            });

            filesContainer.appendChild(list);
            fileListWrapper.appendChild(filesContainer);
        }
        else{
            filesContainer.style.display = 'none';
            prompt.style.display = 'flex';
        }
    }

    async function fetchDelete(filename){
        console.log('trying to delete ' + filename);
        const result = await fetch(`/delete_image/${filename}`, {
            method: 'DELETE'
        });
        console.log(result.json());
        if (result.status !== 204){
            alert("Failed to delete file");
            return;
        }
        const params = new URLSearchParams(window.location.search);
        let page = params.get('page') ? params.get('page') : 1;
        let page_size = params.get('page_size') ? params.get('page_size') : 10;
        displayFiles(page, page_size);    }

    async function handleAndStoreFiles(file){
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE_BYTES) {
            alert("File type not allowed or file size too large");
            return;
        }
        try {
            const response = await fetch('http://localhost/upload', {
              method: 'POST',
              headers: {'X-Filename': file.name},
              body: file,
            });
            const data = await response.json();
            console.log(data);
            if (currentUploadInput) {
                 currentUploadInput.value = data.url;
            }

        } catch (error) {
            console.error('Error during upload:', error);
        }
    };

    const updateTabStyles = (isImagesPage) => {
        if (isImagesPage) {
            uploadTab.classList.remove('upload__tab--active');
            imagesTab.classList.add('upload__tab--active');
            uploadForm.style.display = 'none';
            filesWrapper.style.display = 'flex';
        } else {
            imagesTab.classList.remove('upload__tab--active');
            uploadTab.classList.add('upload__tab--active');
            uploadForm.style.display = 'flex';
            filesWrapper.style.display = 'none';
            const params = new URLSearchParams(window.location.search);
            let page = params.get('page') ? params.get('page') : 1;
            let page_size = params.get('page_size') ? params.get('page_size') : 10;
            displayFiles(page, page_size);
        }
    };


    imagesTab.addEventListener('click', () => {
        updateTabStyles(true);
    })
    uploadTab.addEventListener('click', () => {
        updateTabStyles(false);
    })

    if (copyButton && currentUploadInput) {
        copyButton.addEventListener('click', () => {
            const textToCopy = currentUploadInput.value;

            if (textToCopy && textToCopy !== 'https://') {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyButton.textContent = 'COPIED!';
                    setTimeout(() => {
                        copyButton.textContent = 'COPY';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    }

    fileUpload.addEventListener('change', (event) => {
        handleAndStoreFiles(event.target.files[0]);
        event.target.value = '';
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropzone.addEventListener('drop', (event) => {
        handleAndStoreFiles(event.dataTransfer.files[0]);
    });

    updateTabStyles();
});