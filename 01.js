const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "F8"
const player = $(".player")
const heading = $("header h2")
const cdThumb = $(".cd-thumb")
const audio = $("#audio")
const cd = $(".cd")
const playBtn = $(".btn-toggle-play")
const progress = $("#progress")
const nextBtn = $(".btn-next")
const prevBtn = $(".btn-prev")
const randomBtn = $(".btn-random")
const repeatBtn = $(".btn-repeat")
const playList = $('.playlist')

// lấy thẻ playlist 
// const playlist = $('.playlist')

const app = {
  currentIndex: 0,
  isPLaying: false,
  isRandom: false,
  isRepeat: false,

  songs: [
    {
      name: "Tam Bái Hồng Trần Lương",
      singer: "Doãn Tích Miên",
      path: "./asset/music/TamBaiHongTranLuong-DoanTichMien-8291765.mp3",
      image: "./asset/image/Tam_bai_hong_tran_luong.jpg"
    },
    {
      name: "Making My Way",
      singer: "Sơn Tùng MTP",
      path: "./asset/music/making-my-way-son-tung-m-tp.mp3",
      image: "./asset/image/Making_my_way.jpg"
    },
    {
      name: "Luôn Yêu Đời",
      singer: "Đen",
      path: "./asset/music/Den-Luon-yeu-doi-ft-Cheng.mp3",
      image: "./asset/image/Luon_yeu_doi.jpg"
    },
    {
      name: "Mật Ngọt",
      singer: "Phạm Hoàng Dung",
      path: "./asset/music/Mat_Ngot.mp3",
      image: "./asset/image/Mat_ngot.jpg"
    },
    {
      name: "Dancing With Your Ghost",
      singer: "Sasha Sloan",
      path: "./asset/music/Sasha_Sloan_-_Dancing_With_Your_Ghost_CeeNaija.com_.mp3",
      image: "./asset/image/Dancing_with_your_ghost.jpg"
    },
  ],

  // tạo 1 biến để lưu cấu hình mỗi khi chuyển bài
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  
  // lưu config 
  setConfig: function (key, value) {
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },

  // render html cho bài hát đang chạy
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb"
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
      `
    })
    playList.innerHTML = htmls.join('')
  },

  // định nghĩa ra những thuộc tính 
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex]
      }
    })
    /*
    cú pháp và định nghĩa của defineProperty:
    -> định nghĩa: Object.defineProperty là một phương thức trong JavaScript được sử dụng để thêm hoặc thay đổi các thuộc tính của một đối tượng. 
    Phương thức này cho phép bạn tạo ra một thuộc tính mới cho đối tượng hoặc chỉnh sửa các thuộc tính hiện có.
    -> cú pháp: Object.defineProperty(object, property, descriptor)
    -   object: Đối tượng mà bạn muốn thêm hoặc thay đổi thuộc tính.
    -   property: Tên của thuộc tính bạn muốn thêm hoặc thay đổi.
    -   descriptor: Một đối tượng mô tả các thuộc tính của thuộc tính được thêm hoặc thay đổi. 
    Đối tượng descriptor có thể chứa các thuộc tính như value, writable, enumerable, và configurable.
    */
  },

  handleEvents: function () {
    const _this = this
    const cdWidth = cd.offsetWidth

    // xử lý hình ảnh bài hát quay và dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)' }
    ], {
      duration: 10000,
      iterations: Infinity
    })

    // dừng xoay hình ảnh khi chưa chạy âm nhạc
    cdThumbAnimate.pause()

    // xử lý phóng to thu nhỏ hình ảnh
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCDWidth = cdWidth - scrollTop
      // console.log(newCDWidth)
      cd.style.width = newCDWidth > 0 ? newCDWidth + "px" : 0
      cd.style.opacity = newCDWidth / cdWidth
    }

    // xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPLaying) {
        // _this.isPLaying = false
        audio.pause()
        // player.classList.remove("playing")
      } else {
        // _this.isPLaying = true
        audio.play()
        // player.classList.add("playing")
      }

    }

    // khi bài hát được play
    audio.onplay = function () {
      _this.isPLaying = true
      player.classList.add("playing")
      cdThumbAnimate.play()
    }

    // khi bài hát được pause
    audio.onpause = function () {
      _this.isPLaying = false
      player.classList.remove("playing")
      cdThumbAnimate.pause()
    }

    // chạy tiến độ bài hát
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
        progress.value = progressPercent
      }
    }

    // xử lý khi kéo tiến độ bài
    progress.onchange = function (e) {
      const seekTime = audio.duration / 100 * e.target.value
      audio.currentTime = seekTime
    }

    // xử lý lúc next bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.nextSong()
      }
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    }

    // xử lý lúc next bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.prevSong()
      }
      audio.play()
      _this.render()
    }

    // xử lý randomBtn khi click 
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      _this.setConfig("isRandom", _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
      /*
      -> Định nghĩa: classList.toggle là một phương thức có sẵn trong JavaScript và được sử dụng để thêm hoặc xóa một lớp (class) từ danh sách các lớp của một phần tử HTML. 
      Nếu lớp đã tồn tại trên phần tử, phương thức sẽ xóa lớp đó; nếu lớp chưa tồn tại, phương thức sẽ thêm lớp đó.
      -> Cú pháp của classList.toggle như sau: element.classList.toggle(className);
      */
    }

    // xử lý lặp bài hát
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig("isRepeat", _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    // xử lý tự động nhảy bài tiếp theo sau khi hết bài hát
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play() // nếu is repeat = true thì tự động chạy bài hát
      } else {
        nextBtn.click()
      }
    }

    // xử lý nút chọn bài hát
    playList.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)")

      // xử lý click vào bài hát
      if (songNode || e.target.closest(".option")) {
        // xử lý khi bấm vào bài hát
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }

        // xử lý khi bấm vào option của bài hát 
        if (e.target.closest(".option")) {

        }
      }
    }
  },

  // nhảy tới thẻ chứa bài hát đang chạy
  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      })
    }, 300)
  },

  // tải bài hát lên phần now playing
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
    audio.src = this.currentSong.path
    // console.log(heading, cdThumb, audio)
  },

  // tải config của now playing
  loadConfig: function () {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },

  // chức năng qua bài
  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },

  // chức năng lùi bài
  prevSong: function () {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },

  // chạy bài hát ngẫu nhiên
  playRandomSong: function () {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)
    this.currentIndex = newIndex
    this.loadCurrentSong()
  },

  // start app chính
  start: function () {
    // tải cấu hình khi start trang
    this.loadConfig()

    // định nghĩa các thuộc tính cho object
    this.defineProperties()

    // xử lý các sự kiện 
    this.handleEvents()

    // tải bài hát hiện tại vào UI
    this.loadCurrentSong()

    // render playlist
    this.render()

    // hiển thị trạng thái cấu hình khi restart trang, phải đặt đúng thứ tự sau render
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
  },
}

app.start()