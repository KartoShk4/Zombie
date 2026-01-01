function nextWave(){
    wave++;
    for(let z of zombies){
        z.speed += 0.1;
        z.health += 10;
    }
}
