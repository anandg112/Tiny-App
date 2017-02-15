module.exports = () => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randStr = "";
  for(let i = 0; i < 6; i++){
    let randNum = Math.floor(Math.random()* chars.length)
    randStr += chars[randNum];
  }
  //console.log(randStr);
  return randStr;
}
