rm -rf .next
rm -rf out
yarn build
yarn export
cp .htaccess out/
rm -rf ../export/out
cp -r out ../export/
cd ../export
firebase deploy
