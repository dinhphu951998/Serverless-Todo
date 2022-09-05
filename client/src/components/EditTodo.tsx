import { Form, Button } from 'semantic-ui-react'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import { useContext, useState } from 'react'
import { UserContext } from 'context/UserContext'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  todoId: string
}

export const EditTodo = ({todoId}: EditTodoProps) => {

  const [file, setFile] = useState(undefined)
  const [uploadState, setUploadState] = useState(UploadState.NoUpload)
  const userContext = useContext(UserContext)


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setFile(files[0])
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!file) {
        alert('File should be selected')
        return
      }

      setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(userContext.idToken, todoId)

      setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      setUploadState(UploadState.NoUpload)
    }
  }


  const renderButton = () => (
    <>
      {uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
      {uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
      <Button
        loading={uploadState !== UploadState.NoUpload}
        type="submit"
      >
        Upload
      </Button>
    </>
  )


  return (
    <div>
      <h1>Edit todo</h1>

      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>File</label>
          <input
            type="file"
            accept="image/*"
            placeholder="Image to upload"
            onChange={handleFileChange}
          />
        </Form.Field>

        {renderButton()}
      </Form>
    </div>
  )

}
