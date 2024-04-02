rm -rf out
rm -rf .next
yarn build
yarn export
cp .htaccess out/
rm -rf out.tar.gz
tar -czvf out.tar.gz out/
mv out.tar.gz /var/www/
cd /var/www
rm -rf html
tar -xzvf out.tar.gz
mv out html
