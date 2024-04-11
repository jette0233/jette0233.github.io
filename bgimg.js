
const backgrounds = [
    'https://img.zcool.cn/community/015b315c73bb4ba801203d22796b80.jpg',
    'https://ts1.cn.mm.bing.net/th/id/R-C.8456fdea74ced5e3fdd618d5c489f0b1?rik=ekRc2f5H5Tqzdg&riu=http%3a%2f%2fwww.netbian.com%2fd%2ffile%2f20120517%2f4bffcf31d26d5e43a6bd931dc4438431.jpg&ehk=XGc9ZPPFkZyGpsw0IJHS8L4gSupTnHQxbuoX8mddy6M%3d&risl=&pid=ImgRaw&r=0',
    'https://bpic.588ku.com/back_pic/05/73/46/715bc80a6fb585f.jpg',
    'https://www.rdonly.com/wp-content/uploads/2019/09/2019-03-06-215901-coolbgitem1.png',
    'https://bpic.588ku.com/back_our/20210610/bg/164f2b05434cb.png'
];

let currentBackgroundIndex = 0;
const backgroundContainer = document.getElementById('backgroundContainer');

function changeBackground() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
    const newBackground = backgrounds[currentBackgroundIndex];
    backgroundContainer.style.backgroundImage = `url('${newBackground}')`;
}
