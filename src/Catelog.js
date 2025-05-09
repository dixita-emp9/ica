// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { generatePdf } from "./services/apiService";
// import "./Catelog.css";

// // Fetch API to get finishes data
// const fetchFinishesData = async () => {
//     try {
//         const response = await fetch("http://127.0.0.1:8000/api/finishes");
//         const data = await response.json();
//         console.log("Full API Response:", data); // Log the full API response
//         console.log("API Response Data:", data.data); // Log the `data` field specifically
//         return data.data || {}; // Return the `data` field or an empty object
//     } catch (error) {
//         console.error("Error fetching finishes data:", error);
//         return {};
//     }
// };

// const Catelog = () => {
//     const [groupedPosts, setGroupedPosts] = useState([]);
//     const [error, setError] = useState("");
//     const navigate = useNavigate();

//     useEffect(() => {
//         const loadData = async () => {
//             const apiData = await fetchFinishesData();
//             console.log("API Data Field:", apiData); // Log the `data` field for debugging

//             if (!apiData || Object.keys(apiData).length === 0) {
//                 setError("No catalog data available. Please check the API response.");
//                 return;
//             }

//             try {
//                 const categorizedPosts = Object.values(apiData).reduce((acc, parentCategoryData) => {
//                     const parentCategory = parentCategoryData.name || "Uncategorized";

//                     if (!acc[parentCategory]) {
//                         acc[parentCategory] = { subcategories: [] };
//                     }

//                     parentCategoryData.subcategories?.forEach((subcat1) => {
//                         const subcategory = subcat1.name || "Other";

//                         const subcatData = {
//                             subcategory,
//                             categories: subcat1.subcategories?.map((subcat2) => ({
//                                 category: subcat2.name || "Other",
//                                 posts: subcat2.posts || [],
//                             })) || [],
//                         };

//                         acc[parentCategory].subcategories.push(subcatData);
//                     });

//                     return acc;
//                 }, {});

//                 const sortedData = Object.entries(categorizedPosts).map(([parentCategory, data]) => ({
//                     parentCategory,
//                     subcategories: data.subcategories,
//                 }));

//                 console.log("Grouped Posts:", sortedData); // Log the grouped posts for debugging
//                 setGroupedPosts(sortedData);
//             } catch (processingError) {
//                 console.error("Error processing API data:", processingError);
//                 setError("Failed to process catalog data.");
//             }
//         };

//         loadData();
//     }, []);

//     const handleBackClick = () => {
//         navigate("/portfolios"); // Navigate to the portfolios page
//     };

//     const handleCardClick = (post) => {
//         navigate(`/portfolios/${post.slug}`, {
//             state: { productId: post.id, catalogName: post.name },
//         });
//     };

//     const handleDownloadPDF = async () => {
//         try {
//             const productIds = groupedPosts.flatMap(group =>
//                 group.subcategories.flatMap(sub =>
//                     sub.categories.flatMap(cat => cat.posts.map(post => post.id))
//                 )
//             );

//             if (productIds.length === 0) {
//                 setError("No valid product IDs found.");
//                 return;
//             }

//             const response = await generatePdf(productIds);

//             if (response && response.data) {
//                 const blob = new Blob([response.data], { type: "application/pdf" });
//                 const url = window.URL.createObjectURL(blob);
//                 const a = document.createElement("a");
//                 const filename = `Catalog_${Date.now()}.pdf`;

//                 a.href = url;
//                 a.setAttribute("download", filename);
//                 document.body.appendChild(a);
//                 a.click();
//                 a.remove();
//             } else {
//                 throw new Error("PDF generation failed. No data returned.");
//             }
//         } catch (err) {
//             console.error("Error generating PDF:", err);
//             setError("Failed to download PDF.");
//         }
//     };

//     return (
//         <div className="main_menu_wrapper container-fluid">
//             <div className="d-flex justify-content-between align-items-center">
//                 <div className="backbtn">
//                     <button onClick={handleBackClick}>
//                         <i className="fa fa-arrow-left"></i>
//                     </button>
//                 </div>
//                 <div>
//                     <button className="pdf_btn" onClick={handleDownloadPDF}>
//                         <i className="fa fa-download"></i> Save PDF
//                     </button>
//                 </div>
//             </div>

//             <div className="portfoiliolist container mt-4 p-4">
//                 {error && <div className="alert alert-warning">{error}</div>}

//                 {Array.isArray(groupedPosts) && groupedPosts.length > 0 ? (
//                     groupedPosts.map(({ parentCategory, subcategories }) => (
//                         <div key={parentCategory} className="category-section mb-5">
//                             <h3 className="parent-category bg-dark bg-opacity-10 p-3 fw-bold">{parentCategory}</h3>

//                             {Array.isArray(subcategories) && subcategories.length > 0 ? (
//                                 subcategories.map(({ subcategory, categories }) => (
//                                     <div key={`${parentCategory}-${subcategory}`} className="sub-category">
//                                         <h5 className="subcategory-name border border-dark rounded-pill d-inline-block py-2 px-4 my-3">{subcategory}</h5>

//                                         {Array.isArray(categories) && categories.length > 0 ? (
//                                             <div className="main-category d-flex flex-wrap gap-4">
//                                                 {categories.map(({ category, posts }) => (
//                                                     <div key={`${parentCategory}-${subcategory}-${category}`} className="category">
//                                                         <div className="posts d-flex gap-3 flex-wrap justify-content-around justify-content-center">
//                                                             {Array.isArray(posts) && posts.length > 0 ? (
//                                                                 posts.map((post) => (
//                                                                     <div key={post.id} className="custom-post-card my-2" onClick={() => handleCardClick(post)}>
//                                                                         <div className="card">
//                                                                             {post.image ? (
//                                                                                 <img
//                                                                                     src={`https://api.ica.amigosserver.com/storage/${post.image}`}
//                                                                                     className="card-img"
//                                                                                     alt={post.title}
//                                                                                 />
//                                                                             ) : (
//                                                                                 <div className="text-muted">No image available</div>
//                                                                             )}
//                                                                             <p className="category-name mb-2">{category || "Uncategorized"}</p>
//                                                                             <div>
//                                                                                 <h5 className="card-title">{post.title}</h5>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                 ))
//                                                             ) : (
//                                                                 <div className="text-danger h-100"><b>{category || "Uncategorized"}</b> posts not available </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         ) : (
//                                             <div className="text-muted">No categories available under {subcategory}</div>
//                                         )}
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="text-muted">No subcategories available under {parentCategory}</div>
//                             )}
//                         </div>
//                     ))
//                 ) : (
//                     <div className="alert alert-info">No catalog data available</div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Catelog;





import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePdf, fetchFinishesData } from "./services/apiService";
import "./Catelog.css";


const Catelog = () => {
    const [groupedPosts, setGroupedPosts] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            const apiData = await fetchFinishesData();

            if (!apiData || Object.keys(apiData).length === 0) {
                setError("No catalog data available.");
                return;
            }

            try {
                const categorizedPosts = Object.values(apiData).reduce((acc, parentCategoryData) => {
                    const parentCategory = parentCategoryData.name || "Uncategorized";

                    if (!acc[parentCategory]) {
                        acc[parentCategory] = { subcategories: [] };
                    }

                    parentCategoryData.subcategories?.forEach((subcat1) => {
                        const subcategory = subcat1.name || "Other";

                        const subcatData = {
                            subcategory,
                            categories: subcat1.subcategories?.map((subcat2) => ({
                                category: subcat2.name || "Other",
                                posts: subcat2.posts || [],
                            })) || [],
                        };

                        acc[parentCategory].subcategories.push(subcatData);
                    });

                    return acc;
                }, {});

                const sortedData = Object.entries(categorizedPosts)
                    .map(([parentCategory, data]) => ({
                        parentCategory,
                        subcategories: data.subcategories.filter((subcat) =>
                            subcat.categories.some((cat) => cat.posts.length > 0)
                        ),
                    }))
                    .filter((group) => group.subcategories.length > 0);

                setGroupedPosts(sortedData);
            } catch (processingError) {
                console.error("Error processing API data:", processingError);
                setError("Failed to process catalog data.");
            }
        };

        loadData();
    }, []);

    const handleBackClick = () => {
        navigate("/portfolios"); // Navigate to the portfolios page
    };

    const handleCardClick = (post) => {
        navigate(`/portfolios/${post.slug}`, {
            state: { productId: post.id, catalogName: post.name },
        });
    };

    const handleDownloadPDF = async () => {
        try {
            const productIds = groupedPosts.flatMap(group =>
                group.subcategories.flatMap(sub =>
                    sub.categories.flatMap(cat => cat.posts.map(post => post.id))
                )
            );

            if (productIds.length === 0) {
                setError("No valid product IDs found.");
                return;
            }

            const response = await generatePdf(productIds);

            if (response && response.data) {
                const blob = new Blob([response.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                const filename = `Catalog_${Date.now()}.pdf`;

                a.href = url;
                a.setAttribute("download", filename);
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                throw new Error("PDF generation failed. No data returned.");
            }
        } catch (err) {
            console.error("Error generating PDF:", err);
            setError("Failed to download PDF.");
        }
    };

    return (
        <div className="main_menu_wrapper container-fluid">
            <div className="d-flex justify-content-between align-items-center">
                <div className="backbtn">
                    <button onClick={handleBackClick}>
                        <i className="fa fa-arrow-left"></i>
                    </button>
                </div>
                <div>
                    <button className="pdf_btn" onClick={handleDownloadPDF}>
                        <i className="fa fa-download"></i> Save PDF
                    </button>
                </div>
            </div>

            <div className="portfoiliolist container mt-4 p-4">
                {error && <div className="alert alert-warning">{error}</div>}

                {Array.isArray(groupedPosts) && groupedPosts.length > 0 ? (
                    groupedPosts.map(({ parentCategory, subcategories }) => (
                        <div key={parentCategory} className="category-section mb-5">
                            <h3 className="parent-category bg-dark bg-opacity-10 p-3 fw-bold">{parentCategory}</h3>

                            {subcategories.map(({ subcategory, categories }) => (
                                <div key={`${parentCategory}-${subcategory}`} className="sub-category">
                                    <h5 className="subcategory-name border border-dark rounded-pill d-inline-block py-2 px-4 my-3">{subcategory}</h5>

                                    <div className="main-category d-flex flex-wrap gap-4">
                                        {categories
                                            .filter((cat) => cat.posts.length > 0)
                                            .map(({ category, posts }) => (
                                                <div key={`${parentCategory}-${subcategory}-${category}`} className="category">
                                                    <div className="posts d-flex gap-3 flex-wrap justify-content-around justify-content-center">
                                                        {posts.map((post) => (
                                                            <div key={post.id} className="custom-post-card my-2" onClick={() => handleCardClick(post)}>
                                                                <div className="card">
                                                                    {post.image ? (
                                                                        <img
                                                                            src={`https://api.ica.amigosserver.com/storage/${post.image}`}
                                                                            className="card-img"
                                                                            alt={post.title}
                                                                        />
                                                                    ) : (
                                                                        <div className="text-muted">No image available</div>
                                                                    )}
                                                                    <p className="category-name mb-2">{category}</p>
                                                                    <div>
                                                                        <h5 className="card-title">{post.title}</h5>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="alert alert-info">No catalog data available</div>
                )}
            </div>
        </div>
    );
};

export default Catelog;
