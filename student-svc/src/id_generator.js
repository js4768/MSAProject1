module.exports = {
  generate_id: function (first, last) {
    var random = Math.round(Math.random()*10000);
    while(random < 1000) {
      random = Math.round(Math.random()*10000);
    }
    var id = first.charAt(0).toLowerCase()+last.charAt(0).toLowerCase()+random;
    return id;
  }
};