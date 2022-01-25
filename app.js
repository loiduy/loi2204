const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'Loi Le player';

const playlist = $('.playlist');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevSong = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    
    // edit songs array to add your favorite songs
    songs: [
        {
            name: 'Summertime', // song name
            singer: 'K-392', //song singer
            path: './song/Summertime-K-391.mp3', // song path
            image: 'https://i.ytimg.com/vi/25N1pdzvp4c/maxresdefault.jpg' // song image
        },
        {
            name: 'See you again',
            singer: 'Wiz Khalifa',
            path: './song/See-You-Again-Jason-Derulo.mp3',
            image: 'https://amatrendy.net/cdn/files/see-you-again---wiz-khalifa-charlie-puth.jpg'
        },
        {
            name: 'Dịu dàng em đến',
            singer: 'Erik',
            path: './song/Diu-Dang-Em-Den-ERIK-NinjaZ.mp3',
            image: 'https://photo-resize-zmp3.zadn.vn/w240_r1x1_jpeg/cover/3/b/f/6/3bf6a637783cfe6fab0fd75c43939964.jpg'
        },
        {
            name: 'Đế Vương',
            singer: 'Đình Dũng',
            path: './song/De-Vuong.mp3',
            image: 'https://i.ytimg.com/vi/qkPgUgkQE4Y/maxresdefault.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        
        // phóng-thu cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        
        // xử lí cd quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            interations: Infinity
        })
        cdThumbAnimate.pause();
        
        // khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
        
        // khi play
        audio.onplay = function() {
            cdThumbAnimate.play();
            _this.isPlaying = true;
            player.classList.add('playing');
        }
        
        // khi pause
        audio.onpause = function() {
            cdThumbAnimate.pause();
            _this.isPlaying = false;
            player.classList.remove('playing');
        }
        
        // tiến độ bài hát
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                
                progress.value = progressPercent;
            }
        }
        // xử lí khi tua
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime
        }
        
        // khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        
        // khi prev song
        prevSong.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        
        // random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }
        
        // xử lí phát lại
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }
        
        // xử lí next song khi audio end
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }
        
        // listen click action
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            
            if (songNode || e.target.closest('.option')) {
                // click in song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `
            url('${this.currentSong.image}')
        `;
        audio.src = this.currentSong.path;
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                
            });
        }, 300)
    },
    loadConfig: function() {
        this.config.isRandom;
        this.config.isRepeat;
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        this.loadConfig();
        this.defineProperties();
        this.handleEvent();
        this.loadCurrentSong();
        
        this.render();
        
        // start status of repeat, random btn
        randomBtn.classList.toggle('active', _this.isRandom);
        repeatBtn.classList.toggle('active', _this.isRepeat);
    }
}

app.start()