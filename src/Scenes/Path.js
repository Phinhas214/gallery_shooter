

let run_mode = false;


class Player extends Phaser.Scene {
    curve;
    curve2
    num_enemies = 4;
    player_health = 2;
    
    constructor(){
        super("playerScene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings

        this.planeX = 660;
        this.planeY = 580;

        this.bulletCooldown = 1 ;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;

        this.alienBulletCooldown = 20;        // Number of update() calls to wait before making a new bullet for alien ship
        this.alienBulletCooldownCounter = 0;

    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("background", "backgroundColorFall.png");  
        this.load.image("plane", "ship_0014.png");
        this.load.image("alienShip1", "shipBeige_manned.png");          
        this.load.image("alienShip2", "shipBlue_manned.png");
        this.load.image("laser", "tank_explosion4.png"); 
        this.load.image("alienBullet", "tile_0000.png");
        this.load.image("heart", "heart.png"); 

        this.load.audio("baam", "footstep_grass_002.ogg");
        
        
        this.load.image("boom1", "laser_burst1.png"); 
        this.load.image("boom2", "laser_burst2.png"); 
        this.load.image("boom3", "laser_burst3.png"); 
        this.load.image("boom4", "laser_burst4.png"); 
        this.load.image("boom5", "laser_burst5.png"); 
        this.load.image("boom6", "laser_burst6.png"); 
        this.load.image("boom7", "laser_burst7.png"); 
        this.load.image("boom8", "laser_burst8.png"); 
        this.load.image("boom9", "laser_burst9.png"); 
        this.load.image("boom10", "laser_burst10.png"); 

        this.load.bitmapFont('classic_font', 'atari-smooth.png', 'atari-smooth.xml');


        this.Akey = null;
        this.Dkey = null;
    }

    create() {
        let my = this.my;
        
        this.points = [
            65, 200,
            1335, 100
        ];
        this.points2 = [
            65, 260,
            1335, 260
        ];
        this.curve = new Phaser.Curves.Spline(this.points);
        this.curve2 = new Phaser.Curves.Spline(this.points2);


        //set background scene
        my.sprite.background = this.add.sprite(700, 150, "background");
        my.sprite.background.setScale(1.4);
        //set score text
        this.myScore = this.add.bitmapText(100, 100, 'classic_font', 'Score', 32);
        //position the plane on screen
        my.sprite.plane = this.add.sprite(this.planeX, this.planeY, "plane");
        my.sprite.plane.setScale(3);
        my.sprite.plane.mode = true;
        //position the enemy alien on screen
        my.sprite.alien1 = this.add.follower(this.curve, 10, 10, "alienShip1");
        my.sprite.alien1.setScale(0.5);
        my.sprite.alien2 = this.add.follower(this.curve, 10, 10, "alienShip1");
        my.sprite.alien2.setScale(0.5);
        my.sprite.alien1.visible = false;
        my.sprite.heart1 = this.add.sprite(1200, 590, "heart");
        my.sprite.heart2 = this.add.sprite(1230, 590, "heart");


        // Create white puff animation
        this.anims.create({
            key: "boom",
            frames: [
                { key: "boom1" },
                { key: "boom2" },
                { key: "boom3" },
                { key: "boom4" },
                { key: "boom5" },
                { key: "boom6" },
                { key: "boom7" },
                { key: "boom8" },
                { key: "boom9" },
                { key: "boom10" }

            ],
            frameRate: 60,    // Note: case sensitive (thank you Ivy!)
            repeat: 1,
            hideOnComplete: true
        });


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


        //set a path for alienships to follow
        my.sprite.alien1.mode = true;
        my.sprite.alien2.mode = true;
        my.sprite.alien1.x = this.curve.points[0].x;
        my.sprite.alien1.y = this.curve.points[0].y;
        my.sprite.alien2.x = this.curve2.points[0].x;
        my.sprite.alien2.y = this.curve2.points[0].y;
        my.sprite.alien1.visible = true;
        my.sprite.alien2.visible = true;
            
        let follow_arg = 
        {
            from: 0,
            to: 1,
            delay: 0, 
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            rotateToPath: false
        };
        let follow_arg2 = 
        {
            from: 1,
            to: 0,
            delay: 0, 
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            rotateToPath: false
        };
        my.sprite.alien1.startFollow(follow_arg);
        my.sprite.alien2.startFollow(follow_arg2);

    }

    update() {
        let my = this.my;    // create an alias to this.my for readability
        this.bulletCooldownCounter--;
        this.alienBulletCooldownCounter--;

        if(this.num_enemies == 0) {
            console.log("you won!!! Next screen!!!");
            this.scene.start("nextLevel");
        }

        if(this.player_health == 0) {
            this.scene.start("youLose");
        }
        


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
        if(this.alienBulletCooldownCounter < 0 && my.sprite.alien1.mode == true) {
            // Get the first inactive bullet, and make it active
            let alienBullet = my.sprite.alienBulletGroup.getFirstDead();
            // bullet will be null if there are no inactive (available) bullets
            if (alienBullet != null) {
                alienBullet.active = true;
                alienBullet.visible = true;
                let x = Math.floor((Math.random() * 10) + 1);
                if(x % 2 == 0) {
                    alienBullet.x = my.sprite.alien2.x;
                    alienBullet.y = my.sprite.alien2.y + (my.sprite.alien2.displayHeight/2);
                }
                else if (x % 2 != 0) {
                    alienBullet.x = my.sprite.alien1.x;
                    alienBullet.y = my.sprite.alien1.y + (my.sprite.alien1.displayHeight/2);
                }
                //alienBullet.x = my.sprite.alien2.x;
                //alienBullet.y = my.sprite.alien2.y + (my.sprite.alien2.displayHeight/2);
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
                this.player_health -= 1;
                console.log("after hit: ");
                if(this.player_health == 0) {
                    console.log("0 health ");
                    //my.sprite.plane.visible = false;
                    my.sprite.heart2.visible = false;
                    my.sprite.plane.y = -100;

                    my.sprite.plane.mode = false;
                }
                this.add.sprite(my.sprite.plane.x, my.sprite.plane.y, "laser_burst10").setScale(1).play("boom");
                this.sound.play("baam");
                bullet.x = -100;
                if (this.player_health == 1) {
                    my.sprite.heart1.visible = false;
                    console.log("player health == 1");
                }
                
                
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
            if (this.collides(my.sprite.alien1, bullet)) {
                //my.sprite.alien1.visible = false;
                let x_pos = my.sprite.alien1.x;
                let y_pos = my.sprite.alien1.y;
                my.sprite.alien1.stopFollow();
                my.sprite.alien1.x = -1000;
                this.add.sprite(x_pos, y_pos, "laser_burst10").setScale(1).play("boom");
                this.sound.play("baam");
                bullet.y = -100;
                my.sprite.alien1.x = -100;
                this.num_enemies -= 1;
                
                
                my.sprite.alien1.mode = false;
            }
            else if (this.collides(my.sprite.alien2, bullet)) {
                //my.sprite.alien2.visible = false;
                let x_pos = my.sprite.alien2.x;
                let y_pos = my.sprite.alien2.y;
                my.sprite.alien2.stopFollow();
                my.sprite.alien2.x = -1000;
                this.add.sprite(x_pos, y_pos, "laser_burst10").setScale(1).play("boom");
                this.sound.play("baam");
                
                
                this.num_enemies -= 1;
                
                bullet.y = -100;
                my.sprite.alien2.mode = false;
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





class End extends Phaser.Scene {
    constructor(){
        super("youLose");
    }

    preload() {
        this.load.bitmapFont('classic_font', 'atari-smooth.png', 'atari-smooth.xml');
    }

    create() {
        //this.youLoseText = this.add.bitmapText(100, 100, 'classic_font', 'YOU LOSE!!!', 40);
        this.instructionText = this.add.bitmapText(170, 300, 'classic_font', 'press SPACE bar to restart game', 32);

        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (this.space.isDown) {
            this.scene.start("nextLevel");
        }
    }
}



