import { useState } from "react"
import { Button, Checkbox, Form } from "semantic-ui-react"
import { ProcessState } from "types/ProcessState"
import { Todo } from "types/Todo"

interface IProps {
    todo: Todo,
    processState: ProcessState,
    onSubmit: (todo: Todo, file) => void
}

// const DEBOUNCE_DELAY = 100
// const debounce = (fn, delay) => {
//     var timer = null;
//     console.log("timer", timer)
//     return function () {
//         var context = this, args = arguments;
//         clearTimeout(timer);
//         timer = setTimeout(function () {
//             fn.apply(context, args);
//         }, delay);
//     };
// }

export const TodoForm = ({ todo, processState, onSubmit }: IProps) => {

    const [name, setName] = useState(todo.name)
    const [dueDate, setDueDate] = useState(todo.dueDate)
    const [done, setDone] = useState(todo.done)
    const [file, setFile] = useState(undefined)

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()
        onSubmit({
            ...todo,
            name,
            dueDate,
            done
        }, file)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return
        setFile(files[0])
    }

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    }

    const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDueDate(event.target.value)
    }

    const handleCheckboxChange = (e, data) => {
        setDone(data.checked)
    }

    const renderButton = () => (
        <>
            {processState === ProcessState.SaveMetaData && <p>Saving todo</p>}
            {processState === ProcessState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
            {processState === ProcessState.UploadingFile && <p>Uploading file</p>}
            <Button
                loading={processState !== ProcessState.NoUpload}
                type="submit"
            >
                Save
            </Button>
        </>
    )

    return <Form onSubmit={handleSubmit}>
        <Form.Field>
            <Form.Input type='text' label="Name" value={name} onChange={handleNameChange} />
        </Form.Field>
        <Form.Field>
            <Form.Input type='text' label="Due date" value={dueDate} onChange={handleDueDateChange} />
        </Form.Field>
        <Form.Field>
            <Checkbox label='Done' defaultChecked={done} onChange={handleCheckboxChange} />
        </Form.Field>
        <Form.Field>
            <Form.Input type='file' accept="image/*" label="File" placeholder="Image to upload"
                onChange={handleFileChange} />
        </Form.Field>
        {renderButton()}
    </Form>
}