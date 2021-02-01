const express = require('express')
const app = express()
const fileUpload = require('express-fileupload')
const { Storage } = require('@google-cloud/storage')
const storageFake = new Storage({
  apiEndpoint: 'http://localhost:4443',
  projectId: 'test'
})
const PORT = 8000

app.use(
  fileUpload({
    createParentPath: true
  })
)

app.post('/upload-fake-gcs', async function (req, res) {
  try {
    // create bucket
    await createBucket('gcs-bucket-test')

    const uploadedFile = req.files.uploadedFile
    const bucket = await storageFake.bucket('gcs-bucket-test')

    // upload file
    await bucket
      .file(uploadedFile.name)
      .save(uploadedFile.data, { resumable: false })

    // create bucket
    // await createBucket('gcs-bucket-test')

    // list buckets
    // await listBucket()

    // upload File
    // await uploadFile(bucket, uploadedFile)

    // get Files in Bucket
    // await getFilesBucket(bucket)

    // check file is exist in bucket
    // await checkFileExist(bucket, uploadedFile.name)

    // get singed url : not working
    await getSignedUrl(bucket, uploadedFile)

    // gcs ACL: not working
    await configACL(bucket, uploadedFile)

    return res.send('Test fake-gcs-server success!')
  } catch (error) {
    console.log(error)
    return res.sendStatus(500)
  }
})

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

const uploadFile = async (bucket, file) => {
  await bucket.file(file.name).save(file.data, { resumable: false })
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
  return await bucket.file(fileName).exists()
}

const configACL = async (bucket, file) => {
  await bucket.file(file.name).save(file.data, { resumable: false })
  const acl = await bucket.file(file.name).acl
  await acl.owners.addAllUsers()
  // owners, readers, writers: addUser(), addGroup(), addAllAuthenticatedUsers() , deleteAllAuthenticatedUsers(), addAllUsers(), deleteAllUsers(), addDomain(), deleteDomain(), deleteGroup(), addProject(), deleteProject(), deleteUser()
}

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
