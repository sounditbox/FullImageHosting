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

    imagesTab.addEventListener('click', () => {
        updateTabStyles(true);
    })
    uploadTab.addEventListener('click', () => {
        updateTabStyles(false);
    })



    const updateTabStyles = (isImagesPage) => {
        // const storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];
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
            displayFiles();
        }
    };

    const displayFiles = () => {
        // fetch images from backend
        const storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];

        if (storedFiles.length !== 0) {
            prompt.style.display = 'none';
            filesContainer.style.display = 'grid';
            const list = document.getElementById('file-list');
            list.innerHTML = '';

            storedFiles.forEach((fileData, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-list-item';
                fileItem.innerHTML = `
                    <div class="file-col file-col-name">
                        <span class="file-icon"><img src="/static/image-uploader/img/icon/Group.png" alt="file icon"></span>
                        <span class="file-name">${fileData.name}</span>
                    </div>
                    <div class="file-col file-col-url">https://sharefile.xyz/${fileData.name}</div>
                    <div class="file-col file-col-delete">
                        <button class="delete-btn" data-index="${index}"><img src="/static/image-uploader/img/icon/delete.png" alt="delete icon"></button>
                    </div>
                `;
                list.appendChild(fileItem);
            });

            filesContainer.appendChild(list);
            fileListWrapper.appendChild(filesContainer);
            addDeleteListeners();
        }
        else{
            filesContainer.style.display = 'none';
            prompt.style.display = 'flex';
        }
    };

    const addDeleteListeners = () => {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                // fetch to delete file from server
                const indexToDelete = parseInt(event.currentTarget.dataset.index);
                let storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];
                console.log(storedFiles);
                if (storedFiles.length === 0){
                    prompt.style.display = 'flex';
                }
                storedFiles.splice(indexToDelete, 1);
                localStorage.setItem('uploadedImages', JSON.stringify(storedFiles));
                displayFiles();
            });
        });
    };

    const handleAndStoreFiles = (files) => {
        if (!files || files.length === 0) {
            return;
        }
        const storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        let filesAdded = false;
        let lastFileName = '';

        for (const file of files) {
            if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE_BYTES) {
                continue;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const fileData = { name: file.name, url: event.target.result };
                storedFiles.push(fileData);
                localStorage.setItem('uploadedImages', JSON.stringify(storedFiles));
                updateTabStyles();
            };
            reader.readAsDataURL(file);
            filesAdded = true;
            lastFileName = file.name;
        }

        if (filesAdded) {
            if (currentUploadInput) {
                currentUploadInput.value = `https://sharefile.xyz/${lastFileName}`;
            }
            alert("Files selected successfully! Go to the 'Images' tab to view them.");
        }
    };

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
        const file = event.target.files[0];
        if (!file) return;
        try {
            const response = fetch('http://localhost/upload', {
              method: 'POST',
              headers: {'X-Filename': file.name},
              body: file,
            });

            if (response.status == 201) {
              const result = response.json();
              console.log('File uploaded successfully:', result);
            } else {
              console.error('Upload failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error during upload:', error);
        }
        // handleAndStoreFiles(event.target.files);
        event.target.value = '';
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropzone.addEventListener('drop', (event) => {
        handleAndStoreFiles(event.dataTransfer.files);
    });

    updateTabStyles();
});