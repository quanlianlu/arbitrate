#!/usr/bin/env bash
PROJECT_HOME=`cd ../;pwd`
TAR_NAME=web.tar.gz
cd $PROJECT_HOME
echo "开始编译打包"
node build/build.js
tar -czvf $PROJECT_HOME/$TAR_NAME -C $PROJECT_HOME/dist index.html static
echo "编译打包完成"

REMOTE_HOME=/opt/steward
echo "开始上传'$TAR_NAME'到远程10.129.194.173的最新应用目录"
scp $TAR_NAME root@10.129.194.173:$REMOTE_HOME/recent
echo "连接服务器10.129.194.173"
ssh -tt root@10.129.194.173 << remotessh
cd $REMOTE_HOME
echo "备份应用"
tar -czvf $REMOTE_HOME/bak/$TAR_NAME`date +%Y%m%d%H%M%S` --remove-files -C $REMOTE_HOME/web index.html static
echo "解压压缩包"
tar -xzvf $REMOTE_HOME/recent/$TAR_NAME -C $REMOTE_HOME/web
echo "移除压缩包"
rm -rf $REMOTE_HOME/recent/$TAR_NAME
exit
remotessh


