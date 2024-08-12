function compareTitle(a, b) {
    if ( a.title < b.title ){
        return -1;
      }
      if ( a.title > b.title ){
        return 1;
      }
      return 0;
}

function compareStatus(a, b) {
    const statusOrder = {
        current: 1,
        completed: 2,
        onhold: 3,
        dropped: 4,
        planned: 5
    }

    return statusOrder[a.status] - statusOrder[b.status];
}

module.exports = { 
    compareTitle,
    compareStatus
 };