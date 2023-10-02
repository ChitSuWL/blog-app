import { withAuthenticator } from "@aws-amplify/ui-react";
import { useState, useRef, React } from "react";
import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import { createPost } from "../src/graphql/mutations";
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";

const initialState = { title: "", content: "" };
function CreatePost() {
  const [post, setPost] = useState(initialState);
  const { title, content } = post;
  const router = useRouter();
  const [image, setImage] = useState(null);
  const imageFile = useRef(null);

  function onChange(e) {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value,
    }));
  }
  async function createNewPost() {
    if (!title || !content) return;
    const id = uuid();
    post.id = id;
    if (image) {
      const filename = `${image.name}_${uuid()}`;
      //partyfoto_223984uqwefdasd8283
      post.coverImage = filename;
      await Storage.put(filename, imageFile.current.files[0]);
    }
    await API.graphql({
      query: createPost,
      variables: { input: post },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    router.push(`/posts/${id}`);
  }
  async function uploadImage() {
    imageFile.current.click();
  }
  function handleChange(e) {
    const fileUploaded = e.target.files[0];
    if (!fileUploaded) return;
    setImage(fileUploaded);
  }

  return (
    <div>
      <hl className="text-3xl font-semibold tracking-wide mt-6">
        Create New Post
      </hl>
      <input
        onChange={onChange}
        name="title"
        placeholder="Title..."
        value={post.title}
        className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
      />
      {image && <img src={URL.createObjectURL(image)} className="my-4" />}
      <SimpleMDE
        value={post.content}
        placeholder="Content..."
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <input
        type="file"
        ref={imageFile}
        className="absolute w-0 h-0"
        onChange={handleChange}
      />
      <button
        type="button"
        className="mb-4 bg-green-600 text-white
      font-semibold px-8 py-2 rounded-lg"
        onClick={uploadImage}
      >
        Upload Cover Image
      </button>{" "}
      <button
        type="button"
        className="mb-4 bg-blue-600 text-white
      font-semibold px-8 py-2 rounded-lg"
        onClick={createNewPost}
      >
        Create Post
      </button>{" "}
    </div>
  );
}
export default withAuthenticator(CreatePost);
