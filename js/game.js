(function() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var gameScore = 0;
  var highScore = 0;

  var SantaGame = {
    init: function() {
      this.game = new Phaser.Game(width, height, Phaser.CANVAS, 'game');

      // Resize handler to adjust game size on window resize
      window.addEventListener('resize', () => {
        var w = window.innerWidth;
        var h = window.innerHeight;
        this.game.scale.setGameSize(w, h);
        // Adjust background and UI elements that depend on size
        if (this.bg) {
          this.bg.width = w;
          this.bg.height = h;
        }
        if (this.startBtn) {
          this.startBtn.x = this.game.world.width / 2 - 159;
          this.startBtn.y = this.game.world.height - 120;
        }
        if (this.playBtn) {
          this.playBtn.x = this.game.world.width / 2 - 159;
          this.playBtn.y = this.game.world.height - 120;
        }
        if (this.restartBtn) {
          this.restartBtn.x = this.game.world.width / 2 - 183.5;
          this.restartBtn.y = 280;
        }
        if (this.score) {
          this.score.x = 20;
          this.score.y = 20;
        }
        if (this.highScore) {
          this.highScore.x = 20;
          this.highScore.y = 45;
        }
      });

      this.game.state.add("load", this.load);
      this.game.state.add("play", this.play);
      this.game.state.add("title", this.title);
      this.game.state.add("gameOver", this.gameOver);
      this.game.state.add("instructions", this.instructions);
      this.game.state.start("load");
    },

    load: {
      preload: function() {
        this.game.load.audio('drivin-home', 'assets/drivin-home-low.mp3');
        this.game.load.audio('modi-ji-bkl', 'assets/modi-ji-bkl.mp3');
        this.game.load.audio('hop', 'assets/jump-sound.mp3');
        this.game.load.image('platform', 'assets/ground.png');
        this.game.load.spritesheet('modi-running', 'assets/modi-running.png', 37, 52);
        this.game.load.image('background', 'assets/background.png');
        this.game.load.image('lotus', 'assets/lotus.png');
        this.game.load.image("logo", "assets/game-logo.png");
        this.game.load.image("instructions", "assets/instructions.png");
        this.game.load.image("game-over", "assets/game-over.png");
        this.game.load.image("startbtn", "assets/start-btn.png");
        this.game.load.image("playbtn", "assets/play-btn.png");
        this.game.load.image("restartBtn", "assets/restart-btn.png");
      },
      create: function() {
        this.game.state.start("title");
      }
    },

    title: {
      create: function() {
        this.bg = this.game.add.tileSprite(0, 0, width, height, 'background');
        this.logo = this.game.add.sprite(this.game.world.width / 2 - 158, 20, 'logo');
        this.logo.alpha = 0;
        this.game.add.tween(this.logo).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0);
        this.startBtn = this.game.add.button(this.game.world.width / 2 - 159, this.game.world.height - 120, 'startbtn', this.startClicked, this);
        this.startBtn.alpha = 0;
        this.game.add.tween(this.startBtn).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 1000);
      },
      startClicked: function() {
        this.game.state.start("instructions");
      }
    },

    instructions: {
      create: function() {
        this.bg = this.game.add.tileSprite(0, 0, width, height, 'background');
        this.instructions = this.game.add.sprite(this.game.world.width / 2 - 292, 30, 'instructions');
        this.instructions.alpha = 0;
        this.game.add.tween(this.instructions).to({ alpha: 1 }, 800, Phaser.Easing.Linear.None, true, 0);
        this.playBtn = this.game.add.button(this.game.world.width / 2 - 159, this.game.world.height - 120, 'playbtn', this.playClicked, this);
        this.playBtn.alpha = 0;
        this.game.add.tween(this.playBtn).to({ alpha: 1 }, 800, Phaser.Easing.Linear.None, true, 800);
      },
      playClicked: function() {
        this.game.state.start("play");
      }
    },

    play: {
      create: function() {
        highScore = gameScore > highScore ? Math.floor(gameScore) : highScore;
        gameScore = 0;
        this.currentFrame = 0;
        this.particleInterval = 2 * 60;
        this.gameSpeed = 580;
        this.isGameOver = false;
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.music = this.game.add.audio("drivin-home");
        this.music.loop = true;
        this.music.play();

        this.bg = this.game.add.tileSprite(0, 0, width, height, 'background');
        this.bg.fixedToCamera = true;
        this.bg.autoScroll(-this.gameSpeed / 6, 0);

        this.emitter = this.game.add.emitter(this.game.world.centerX, -32, 50);

        this.platforms = this.game.add.group();
        this.platforms.enableBody = true;
        this.platforms.createMultiple(5, 'platform', 0, false);
        this.platforms.setAll('anchor.x', 0.5);
        this.platforms.setAll('anchor.y', 0.5);

        var plat;
        for (var i = 0; i < 5; i++) {
          plat = this.platforms.getFirstExists(false);
          plat.reset(i * 192, this.game.world.height - 24);
          plat.width = 192;
          plat.height = 24;
          this.game.physics.arcade.enable(plat);
          plat.body.immovable = true;
          plat.body.bounce.set(0);
        }
        this.lastPlatform = plat;

        this.santa = this.game.add.sprite(100, this.game.world.height - 200, 'modi-running');
        this.santa.animations.add("run");
        this.santa.animations.play('run', 20, true);
        this.game.physics.arcade.enable(this.santa);
        this.santa.body.gravity.y = 1500;
        this.santa.body.collideWorldBounds = true;

        this.emitter.makeParticles('lotus');
        this.emitter.maxParticleScale = .02;
        this.emitter.minParticleScale = .001;
        this.emitter.setYSpeed(100, 200);
        this.emitter.gravity = 0;
        this.emitter.width = this.game.world.width * 1.5;
        this.emitter.minRotation = 0;
        this.emitter.maxRotation = 40;

        this.game.camera.follow(this.santa);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.emitter.start(false, 0, 0);

        this.score = this.game.add.text(20, 20, '', {
          font: "24px Arial",
          fill: "white",
          fontWeight: "bold"
        });

        if (highScore > 0) {
          this.highScore = this.game.add.text(20, 45, 'Best: ' + highScore, {
            font: "18px Arial",
            fill: "white"
          });
        }
      },

      update: function() {
        var that = this;
        if (!this.isGameOver) {
          gameScore += 0.5;
          this.gameSpeed += 0.03;
          this.score.text = 'Score: ' + Math.floor(gameScore);
          this.currentFrame++;
          var moveAmount = this.gameSpeed / 100;
          this.game.physics.arcade.collide(this.santa, this.platforms);

          if (this.santa.body.bottom >= this.game.world.bounds.bottom) {
            this.isGameOver = true;
            this.endGame();
          }

          if ((this.cursors.up.isDown && this.santa.body.touching.down) ||
              (this.spacebar.isDown && this.santa.body.touching.down) ||
              (this.game.input.mousePointer.isDown && this.santa.body.touching.down) ||
              (this.game.input.pointer1.isDown && this.santa.body.touching.down)) {
            this.jumpSound = this.game.add.audio("hop");
            this.jumpSound.play();
            this.santa.body.velocity.y = -500;
          }

          if (this.particleInterval === this.currentFrame) {
            this.emitter.makeParticles('lotus');
            this.currentFrame = 0;
          }

          this.platforms.children.forEach(function(platform) {
            platform.body.position.x -= moveAmount;
            if (platform.body.right <= 0) {
              platform.kill();
              var plat = that.platforms.getFirstExists(false);
              plat.reset(that.lastPlatform.body.right + 192, that.game.world.height - (Math.floor(Math.random() * 50)) - 24);
              plat.body.immovable = true;
              that.lastPlatform = plat;
            }
          });
        }
      },

      endGame: function() {
        this.music.stop();
        this.music = this.game.add.audio("modi-ji-bkl");
        this.music.play();
        this.game.state.start("gameOver");
      }
    },

    gameOver: {
      create: function() {
        this.bg = this.game.add.tileSprite(0, 0, width, height, 'background');
        this.msg = this.game.add.sprite(this.game.world.width / 2 - 280.5, 50, 'game-over');
        this.msg.alpha = 0;
        this.game.add.tween(this.msg).to({ alpha: 1 }, 600, Phaser.Easing.Linear.None, true, 0);
        this.score = this.game.add.text(this.game.world.width / 2 - 100, 200, 'Score: ' + Math.floor(gameScore), {
          font: "42px Arial",
          fill: "white"
        });
        this.score.alpha = 0;
        this.game.add.tween(this.score).to({ alpha: 1 }, 600, Phaser.Easing.Linear.None, true, 600);
        this.restartBtn = this.game.add.button(this.game.world.width / 2 - 183.5, 280, 'restartBtn', this.restartClicked, this);
        this.restartBtn.alpha = 0;
        this.game.add.tween(this.restartBtn).to({ alpha: 1 }, 600, Phaser.Easing.Linear.None, true, 1000);
      },
      restartClicked: function() {
        this.game.state.start("play");
      }
    }
  };

  SantaGame.init();
})();
