const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs");

// const items = ["Eat", "Code", "Sleep"];
// const workItems = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://pewpew-admin:test123@cluster0.jnba9zm.mongodb.net/todolistDB?retryWrites=true&w=majority");

//mongoose schema
const itemsSchema = {
  name: String,
};


//mongoose model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todo list",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}


const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {
  // let today = new Date();
  // let option = {
  //     weekday: "long",
  //     day: "numeric",
  //     month: "long"
  // }
  // let day = today.toLocaleDateString("en-us", option);

  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err){
          if(err){
              console.log(err)
          }else{
              console.log("Successfully saved default items to database")
          }
      })

      res.redirect("/")

    }else{
        res.render("list", { listTitle: "Today", newItem: foundItems });
    }

  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save()
  res.redirect("/")
  }else{
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox
    const listName = req.body.listName

    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err) {
        if(err) {
          console.log(err)
        }else{
          console.log("Successfully removed")
          res.redirect("/")
        }
      })
    }else{
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, result) {
        if(!err){
          res.redirect("/" + listName);
        }

      })
    }
})

app.get("/:customLink", function(req, res) {
  const customListItem = _.capitalize(req.params.customLink)

  List.findOne({name: customListItem}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListItem,
          items: defaultItems
        })

        list.save()
        res.redirect("/" + customListItem);
      }else{
        res.render("list", { listTitle: foundList.name , newItem: foundList.items })
      }
    }
  })

})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newItem: workItems });
});

app.listen(4000, function () {
  console.log("Server started on port 4000");
});
