class NextLevel extends Phaser.Scene {
    curve;
    constructor(){
        super("nextLevel");
        this.my = {sprite: {}};

        this.planeX = 660;
        this.planeY = 580;

        this.bulletCooldown = 1 ;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;

        this.alienBulletCooldown = 20;        // Number of update() calls to wait before making a new bullet for alien ship
        this.alienBulletCooldownCounter = 0;
    }

    

    create() {
        let my = this.my;
        my.sprite.background = this.add.sprite(700, 150, "background");
        my.sprite.background.setScale(1.4);

        //my.sprite.bigBad = this.add.sprite(100, 100, "alienShip2");

        this.points = [
            180, 100,
            1150, 100,
            1150, 260, 
            180, 260,
            180, 100

        ];

        this.curve = new Phaser.Curves.Spline(this.points);
        my.sprite.bigBad = this.add.follower(this.curve, 10, 10, "alienShip2");

        my.sprite.bigBad.mode = true;
        my.sprite.bigBad.x = this.curve.points[0].x;
        my.sprite.bigBad.y = this.curve.points[0].y;
        my.sprite.bigBad.visible = true;

         //position the plane on screen
         my.sprite.plane = this.add.sprite(this.planeX, this.planeY, "plane");
         my.sprite.plane.setScale(3);
         my.sprite.plane.mode = true;

        my.sprite.heart = this.add.sprite(1200, 590, "heart");
            
        let follow_arg = 
        {
            from: 0,
            to: 1,
            delay: 0, 
            duration: 2000,
            ease: 'Sine.easeInOutBounce',
            repeat: -1,
            yoyo: true,
            rotateToPath: false
        };
        my.sprite.bigBad.startFollow(follow_arg);


        // // Create white puff animation
        // this.anims.create({
        //     key: "boom",
        //     frames: [
        //         { key: "boom1" },
        //         { key: "boom2" },
        //         { key: "boom3" },
        //         { key: "boom4" },
        //         { key: "boom5" },
        //         { key: "boom6" },
        //         { key: "boom7" },
        //         { key: "boom8" },
        //         { key: "boom9" },
        //         { key: "boom10" }

        //     ],
        //     frameRate: 60,    // Note: case sensitive (thank you Ivy!)
        //     repeat: 1,
        //     hideOnComplete: true
        // });

        // In this approach, we create a single "group" game object which then holds up
        // to 10 bullet sprites
        // See more configuration options here: 
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/group/
        my.sprite.alienBulletGroup = this.add.group({
            defaultKey: "alienBullet",
            maxSize: 12
            }
        )

        // Create all of the bullets at once, and set them to inactive
        // See more configuration options here:
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/group/
        my.sprite.alienBulletGroup.createMultiple({
            active: false,
            key: my.sprite.alienBulletGroup.defaultKey,
            repeat: my.sprite.alienBulletGroup.maxSize-1
        });


        //same thing for player bullets
        my.sprite.bulletGroup = this.add.group({
            defaultKey: "laser",
            maxSize: 10
            }
        )  

        //same thing for player bullets
        my.sprite.bulletGroup.createMultiple({
            active: false,
            key: my.sprite.bulletGroup.defaultKey,
            repeat: my.sprite.bulletGroup.maxSize-1
        });

         //Polling definition of key "A", means move left
         this.Akey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
         //Polling definition of key "D", means move right
         this.Dkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
         this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.bulletSpeed = 10;

        
    }

    update() {
        let my = this.my;    // create an alias to this.my for readability

        this.bulletCooldownCounter--;
        this.alienBulletCooldownCounter--;

        //move left
        if(this.Akey.isDown) {
            my.sprite.plane.x -= 5;
            if (my.sprite.plane.x <= my.sprite.plane.width) my.sprite.plane.x = my.sprite.plane.width;

        }
        //move right
        else if(this.Dkey.isDown) {
            my.sprite.plane.x += 5;
            if (my.sprite.plane.x >= game.config.width - my.sprite.plane.width) my.sprite.plane.x = game.config.width - my.sprite.plane.width;
        }


        //check for alien bullet being fired
        if(this.alienBulletCooldownCounter < 0 && my.sprite.bigBad.mode == true) {
            // Get the first inactive bullet, and make it active
            let alienBullet = my.sprite.alienBulletGroup.getFirstDead();
            // bullet will be null if there are no inactive (available) bullets
            if (alienBullet != null) {
                alienBullet.active = true;
                alienBullet.visible = true;

                alienBullet.x = my.sprite.bigBad.x;
                alienBullet.y = my.sprite.bigBad.y + (my.sprite.bigBad.displayHeight/2);

                this.alienBulletCooldownCounter = this.alienBulletCooldown;
            }
        }

        // check for alein bullet going offscreen
        for (let bullet of my.sprite.alienBulletGroup.getChildren()) {
            if (bullet.y > 650+(bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
        }
        //check for player and bullet collision
        for (let bullet of my.sprite.alienBulletGroup.getChildren()) {
            if (this.collides(my.sprite.plane, bullet)) {
                
                //my.sprite.plane.visible = false;
                this.boom = this.add.sprite(my.sprite.plane.x, my.sprite.plane.y, "laser_burst10").setScale(1).play("boom");
                my.sprite.plane.y = -100;
                this.sound.play("baam");
                bullet.x = -100;
                
                //my.sprite.alien1.stopFollow();
                my.sprite.plane.mode = false;
                this.scene.start("youLose");
            }
        }

        // Check for player bullet being fired
        if (this.space.isDown) {
            if (this.bulletCooldownCounter < 0 && my.sprite.plane.mode == true) {
                // Get the first inactive bullet, and make it active
                let bullet = my.sprite.bulletGroup.getFirstDead();
                // bullet will be null if there are no inactive (available) bullets
                if (bullet != null) {
                    bullet.active = true;
                    bullet.visible = true;
                    bullet.x = my.sprite.plane.x;
                    bullet.y = my.sprite.plane.y - (my.sprite.plane.displayHeight/2);
                    this.bulletCooldownCounter = this.bulletCooldown;
                }
            }
        }

        // check for player bullet going offscreen
        for (let bullet of my.sprite.bulletGroup.getChildren()) {
            if (bullet.y < -(bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
        }
        //check for bullet and alien collision
        for (let bullet of my.sprite.bulletGroup.getChildren()) {
            if (this.collides(my.sprite.bigBad, bullet)) {
                //my.sprite.alien1.visible = false;
                let x_pos = my.sprite.bigBad.x;
                let y_pos = my.sprite.bigBad.y;
                my.sprite.bigBad.stopFollow();
                my.sprite.bigBad.x = -1000;
                this.add.sprite(x_pos, y_pos, "laser_burst10").setScale(1).play("boom");
                this.sound.play("baam");
                bullet.y = -100;
                my.sprite.bigBad.x = -100;
                this.num_enemies -= 1;
                this.scene.start("youWin");
                
                
                //my.sprite.alien1.mode = false;
            }
        }

        // move bullets
        my.sprite.bulletGroup.incY(-this.bulletSpeed);
         // move alien bullets
        my.sprite.alienBulletGroup.incY(this.bulletSpeed);
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }
    
}


class Win extends Phaser.Scene {
    constructor(){
        super("youWin");
    }

    preload() {
        this.load.bitmapFont('classic_font', 'atari-smooth.png', 'atari-smooth.xml');
    }

    create() {
        this.youLoseText = this.add.bitmapText(100, 100, 'classic_font', 'YOU WON!!!', 32);
        this.instructionText = this.add.bitmapText(100, 500, 'classic_font', 'press SPACE bar to restart game', 32);

        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (this.space.isDown) {
            this.scene.start("nextLevel");
        }
    }
}