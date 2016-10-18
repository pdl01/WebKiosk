#!/bin/sh
WORKING_DIR="/home/vagrant/www/html/javascript"
ZIP_DOWNLOAD_DIR="$WORKING_DIR/zip";
ZIP_FILE="$ZIP_DOWNLOAD_DIR/testX.zip";
ZIP_BACKUP="$ZIP_DOWNLOAD_DIR/testX.zip.old.$timestamp";
SRC_URL="https://www.dropbox.com/sh/jydi6uup1g0s2ab/AAD6ju8zVBGqiMdABTD6iZj7a?dl=1";
ZIP_DEST="$ZIP_DOWNLOAD_DIR/package";
WWW_DEST="$WORKING_DIR/package";
timestamp=$(date +%s);
BACKUP_FILE_NAME_PORTION="$WORKING_DIR/package.old";
BACKUP_DEST="$BACKUP_FILE_NAME_PORTION.$timestamp";

BACKUP_NUM=10;

if [ ! -d $ZIP_DOWNLOAD_DIR ]; then
 mkdir -p $ZIP_DOWNLOAD_DIR
fi

#rm -f $ZIP_FILE;
mv $ZIP_FILE $ZIP_BACKUP;

wget -O $ZIP_FILE -T 5 $SRC_URL;

#if the file didn't download, don't proceed
if [ ! -s "$ZIP_FILE" ]; then
        echo "Empty File after download";
        exit 1;
fi

rm -Rf $ZIP_DEST;
mkdir $ZIP_DEST;
unzip -d $ZIP_DEST $ZIP_FILE;
mv $WWW_DEST $BACKUP_DEST;
cp -R $ZIP_DEST $WWW_DEST;
chmod -R 777 $WWW_DEST;

#cleanup the old packages so we don't run out of space. keep the last x items
ls -t $BACKUP_FILE_NAME_PORTION* | tail -n +4 | xargs rm --

#cleanup the old zip files so we don't run out of space
