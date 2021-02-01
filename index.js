const { Storage } = require('@google-cloud/storage')
const storageFake = new Storage({
  apiEndpoint: 'http://localhost:4443',
  projectId: 'test'
})

const fakeGCSServer = async () => {
  // create bucket
  await createBucket('gcs-bucket-test')

  const bucket = await storageFake.bucket('gcs-bucket-test')

  // init file
  const buf = Buffer.from('Hello fake gcs server')
  const file = {
    data: buf,
    name: 'fileUpload'
  }

  // upload
  await bucket.file('hello-fake-gcs-server').save(buf, { resumable: false })

  // list buckets
  await listBucket()

  // get files in Bucket
  await getFilesBucket(bucket)

  // check file is exist in bucket
  await checkFileExist(bucket, file.name)

  // get singed url : not working
  // await getSignedUrl(bucket, file)

  // gcs ACL: not working
  // await configACL(bucket, file)
}

const createBucket = async (bucketName) => {
  return await storageFake.createBucket(bucketName)
}

const listBucket = async () => {
  const listb = await storageFake.getBuckets()
  listb[0].forEach((bucket) => {
    console.log('bucket', bucket.id)
  })
}

const getFilesBucket = async (bucket) => {
  const [files] = await bucket.getFiles()
  console.log(`Files in ${bucket.name}: `)
  files.forEach((file) => {
    console.log(`- ${file.name}`)
  })
  console.log(`${files.length} files.`)
}

const getSignedUrl = async (bucket, file) => {
  await bucket.file(file.name).save(file.data, { resumable: false })

  // The line below return error " getSignedUrl The action is not provided or invalid"
  const singedUrl = await bucket.file(file.name).getSignedUrl()

  // If want get singed url must use through getMetadata() method
  // const mediaData = await bucket.file(file.name).getMetadata()
  // const singedUrl = mediaData[1].request.href
  console.log(singedUrl)
  return singedUrl
}

const checkFileExist = async (bucket, fileName) => {
  const fileExist = await bucket.file(fileName).exists()
  console.log(
    fileExist
      ? `The file "${fileName}" is exist in bucket`
      : `The file "${fileName}" isn't exist in bucket`
  )
}

const configACL = async (bucket, file) => {
  await bucket.file(file.name).save(file.data, { resumable: false })
  const acl = await bucket.file(file.name).acl
  await acl.owners.addAllUsers()
  // owners, readers, writers: addUser(), addGroup(), addAllAuthenticatedUsers() , deleteAllAuthenticatedUsers(), addAllUsers(), deleteAllUsers(), addDomain(), deleteDomain(), deleteGroup(), addProject(), deleteProject(), deleteUser()
}

fakeGCSServer().catch((err) => {
  console.error(err)
  process.exit(1)
})
