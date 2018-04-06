var fs = require('fs');
var path = require('path');

//解析需要遍历的文件夹，我这以E盘根目录为例  
var filePath = path.resolve('./');

//调用文件遍历方法  
fileDisplay(filePath);

/** 
 * 文件遍历方法 
 * @param filePath 需要遍历的文件路径 
 */
function fileDisplay(filePath) {
  //根据文件路径读取文件，返回文件列表  
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err)
    } else {
      //遍历读取到的文件列表  
      files.forEach(function (filename) {
        //获取当前文件的绝对路径  
        var filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象  
        fs.stat(filedir, function (eror, stats) {
          if (eror) {
            console.warn('获取文件stats失败');
          } else {
            var isFile = stats.isFile();//是文件  
            var isDir = stats.isDirectory();//是文件夹  
            if (isFile) {

              if (filedir.endsWith('.md')) {
                let content = fs.readFileSync(filedir, 'utf8')
                const pattern = /\!\[]\([\s\S]*?\)/g;
                const reg = /\(([^()]+)\)/g
                let result = content.match(pattern)
                let newArray = []
                if (result) {
                  result.forEach((v) => {
                    while (r = reg.exec(v)) {
                      newArray.push(`<img src="${r[1]}" width="700" style="display:block;margin: 0 auto" />`)
                    }
                  })
                  let newContent
                  result.forEach((v, index) => {
                    newContent = content.replace(v, newArray[index])
                  })
                  fs.writeFileSync(filedir, newContent)
                }
              }
            }
            if (isDir && !filedir.includes('.git')) {
              fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件  
            }
          }
        })
      });
    }
  });
}