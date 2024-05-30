import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import data from "./assets/Data.json";

type FormDataType = {
  Survey: Survey[];
};

type Survey = {
  id: number;
  Question: string;
  Type: string;
  required: boolean;
  minChar?: number;
  pageNo: number;
  minVal?: number;
  SubType?: string;
  Options?: string;
};

type FormOutput = {
  id: number;
  Question: string;
  Answer: any;
};

const fetchJSON = (): FormDataType => {
  //console.log(data);

  const surveyItems: Survey[] = data.Survey.map((row: any) => ({
    id: row.id,
    Question: row.Question,
    Type: row.Type,
    required: row.required === "true",
    minChar: row.minChar,
    pageNo: row.pageNo,
    minVal: row.minVal,
    SubType: row.SubType,
    Options: row.Options,
  }));

  //console.log(surveyItems);

  const formData: FormDataType = {
    Survey: surveyItems,
  };

  return formData;
};

const App = () => {
  const [form, setForm] = useState<FormDataType>();
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchJSON();
      setForm(data);
      //console.log(data);
    };
    loadData();
  }, []);

  const buildSchema = (surveyItems: Survey[]) => {
    const schemaObject: any = {};

    surveyItems.forEach((item) => {
      let fieldSchema: any;
      switch (item.Type) {
        case "string":
          fieldSchema = z.string();
          if (item.minChar) fieldSchema = fieldSchema.min(item.minChar);
          break;
        case "number":
          fieldSchema = z.number();
          if (item.minVal) fieldSchema = fieldSchema.min(item.minVal);
          break;
        case "boolean":
          fieldSchema = z.boolean();
          break;
        default:
          throw new Error("Not of correct Type");
      }
      if (item.required) fieldSchema = fieldSchema.nonempty();
      schemaObject[item.Question] = fieldSchema;
    });
    //console.log(schemaObject);
    return z.object(schemaObject);
  };

  // const testSchema: ZodType<FormData> = z
  //   .object({
  //     firstName: z.string().min(2).max(30),
  //     lastName: z.string().min(2).max(30),
  //     email: z.string().email(),
  //     age: z.number().min(18).max(70),
  //     password: z.string().min(8).max(20),
  //     confirmPassword: z.string().min(8).max(20),
  //   })
  //   .refine((data) => data.password === data.confirmPassword, {
  //     message: "Passwords do not match",
  //     path: ["confirmPassword"],
  //   });

  const schema = form ? buildSchema(form.Survey) : z.object({});
  //console.log(schema);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const submitData = (data: any) => {
    console.log("worked:", data);

    const surveyResponse: FormOutput[] = form!.Survey.map((item) => ({
      id: item.id,
      Question: item.Question,
      Answer: data[item.Question],
    }));
    console.log(surveyResponse);
  };
  const onError = (errors: any) => {
    console.error("Validation Errors:", errors);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  if (!form) return <div>Loading...</div>;
  return (
    // <div>
    //   <form onSubmit={handleSubmit(submitData, onError)}>
    //     {form.Survey.map((item) => (
    //       <div key={item.id}>
    //         <label>{item.Question}:</label>
    //         {item.Type === "string" && (
    //           <input type="text" {...register(item.Question)} />
    //         )}
    //         {item.Type === "number" && (
    //           <input
    //             type="number"
    //             {...register(item.Question, { valueAsNumber: true })}
    //           />
    //         )}
    //         {item.Type === "boolean" && (
    //           <input type="checkbox" {...register(item.Question)} />
    //         )}
    //       </div>
    //     ))}
    //     <input type="submit" />
    //   </form>
    // </div>
    <form onSubmit={handleSubmit(submitData, onError)}>
      {form.Survey.map(
        (item) =>
          item.pageNo === currentPage && (
            <div key={item.id}>
              <label>{item.Question}:</label>

              {item.Type === "number" && (
                <input
                  type="number"
                  {...register(item.Question, { valueAsNumber: true })}
                />
              )}
              {item.Type === "boolean" && (
                <input type="checkbox" {...register(item.Question)} />
              )}
              {item.SubType === "MCQ" && (
                <>
                  {item.Options?.split("|").map((c: string, i: number) => (
                    <label key={c}>
                      <input
                        type="radio"
                        value={c}
                        {...register(item.Question)}
                      />
                      {c}
                    </label>
                  ))}
                </>
              )}
              {item.Type === "string" && item?.SubType !== "MCQ" && (
                <input type="text" {...register(item.Question)} />
              )}
            </div>
          )
      )}
      <div>
        {currentPage > 1 && (
          <button type="button" onClick={handlePreviousPage}>
            Previous
          </button>
        )}
        {currentPage < Math.max(...form.Survey.map((item) => item.pageNo)) && (
          <button type="button" onClick={handleNextPage}>
            Next
          </button>
        )}
      </div>
      {currentPage === Math.max(...form.Survey.map((item) => item.pageNo)) && (
        <input type="submit" />
      )}
    </form>
  );
};

export default App;
