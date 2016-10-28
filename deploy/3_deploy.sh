
#tomcat path
nginxPath=/usr/local/openresty/nginx/www/;
appName="GPSCloudWeb";

#deploy war path
warPath=/mnt/deploy/war;
#bakPath=/mnt/deploy/bak/$appName/;

if [ ! -d "$warPath" ]; then
   echo $warPath;
   mkdir -p $warPath;


else

#bak old war file

DATE=$(date +%Y%m%d)
bakPath=/mnt/deploy/bak/$appName/$DATE;
#echo $DATE

if [ ! -d "$bakPath" ]; then 
   mkdir -p $bakPath
   cp -r $nginxPath $bakPath/1/
else
   num=`ls -l $bakPath|grep "^[-|d]"|wc -l`
    num=$(( $num + 1 ))
    newPath=$bakPath/$num
    mkdir -p $newPath
    cp -r $nginxPath $newPath

fi 
fi


# delete old file
rm -rf $nginxPath/*; 

#copy new war file

echo ../dist/
cp -R ../dist/* $nginxPath;
