module.exports = {
  generate_id: function (variablename) {
    var random = Math.round(Math.random()*10000);
    while(random < 1000) {
      random = Math.round(Math.random()*10000);
    }
    var id = variablename.charAt(0).toLowerCase()+random;
    return id;
  }
};