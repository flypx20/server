
function pagination(options){

    return new Promise((resolve,reject)=>{
         let page = options.page || 1;
        
       
        options.model.countDocuments(options.query)
        .then((count)=>{
            let list = [];
            let limit = 5;
            let pages = Math.ceil(count / limit);
             if(parseInt(page) > pages){
                page = pages;
            }
             if(parseInt(page) <= 0){
            page = 1;
        }
            for (var i = 1; i <= pages; i++) {
                list.push(i);
            }

            let skip = (page -1)*limit;
             
            
           let que =  options.model.find(options.query,options.projection);
           if (options.populate) {
                for (let i = 0; i < options.populate.length; i++) {
                    que =  que.populate(options.populate[i]);
                }
           }

            que.sort(options.sort)
            .limit(limit)
            .skip(skip)
            .sort(options.sort)
            .then((user)=>{
                 resolve({
                    count:count,
                    docs:user,
                    page:page*1,
                    pageSize:limit
               });
            });
        });
    });  
}
module.exports = pagination;

    	